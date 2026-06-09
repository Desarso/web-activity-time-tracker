import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = process.env.TRACKER_DATA_DIR || join(__dirname, 'data');
const DATA_FILE = process.env.TRACKER_DATA_FILE || join(DATA_DIR, 'tracker-db.json');
const SESSION_SECRET =
  process.env.TRACKER_SESSION_SECRET || 'dev-session-secret-change-before-production';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const GOOGLE_OAUTH_CLIENT_IDS = (
  process.env.GOOGLE_OAUTH_CLIENT_IDS ||
  process.env.GOOGLE_OAUTH_CLIENT_ID ||
  ''
)
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const MAX_BODY_BYTES = 10 * 1024 * 1024;

const emptyDb = () => ({
  version: 1,
  users: {},
  devices: {},
  activity: {},
  intervals: {},
  snapshots: [],
});

let db = await loadDb();

const server = createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'web-activity-time-tracker-backend',
        generatedAt: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/google') {
      await handleGoogleAuth(req, res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/me') {
      const user = requireUser(req);
      return sendJson(res, 200, buildAccountResponse(user.userId));
    }

    if (req.method === 'POST' && url.pathname === '/api/sync/snapshot') {
      const user = requireUser(req);
      await handleSnapshot(req, res, user.userId);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/activity') {
      const user = requireUser(req);
      return sendJson(res, 200, buildActivityResponse(user.userId, url.searchParams));
    }

    sendJson(res, 404, { error: 'not_found' });
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, {
      error: error.code || 'server_error',
      message: status === 500 ? 'Unexpected backend error' : error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Tracker backend listening on http://localhost:${PORT}`);
  if (!process.env.TRACKER_SESSION_SECRET) {
    console.warn('TRACKER_SESSION_SECRET is not set. Using development secret.');
  }
  if (GOOGLE_OAUTH_CLIENT_IDS.length === 0) {
    console.warn('GOOGLE_OAUTH_CLIENT_IDS is not set. Google token audience checks are disabled.');
  }
});

async function handleGoogleAuth(req, res) {
  const body = await readJsonBody(req);
  if (!body.accessToken || typeof body.accessToken !== 'string') {
    throw httpError(400, 'missing_access_token', 'accessToken is required');
  }

  const googleProfile = await verifyGoogleAccessToken(body.accessToken);
  if (!googleProfile.sub) throw httpError(401, 'invalid_google_profile', 'Google profile missing sub');
  if (googleProfile.email_verified === false) {
    throw httpError(401, 'unverified_email', 'Google email address is not verified');
  }

  const userId = `google:${googleProfile.sub}`;
  const now = new Date().toISOString();

  db.users[userId] = {
    id: userId,
    provider: 'google',
    providerSubject: googleProfile.sub,
    email: googleProfile.email || '',
    name: googleProfile.name || googleProfile.email || 'Google user',
    picture: googleProfile.picture || '',
    createdAt: db.users[userId]?.createdAt || now,
    updatedAt: now,
    lastLoginAt: now,
  };

  const device = normalizeDevice(body.device, userId);
  upsertDevice(userId, device, now);
  await saveDb();

  const token = signSessionToken({
    userId,
    email: db.users[userId].email,
  });

  sendJson(res, 200, {
    token,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ...buildAccountResponse(userId),
    currentDevice: db.devices[deviceKey(userId, device.deviceId)],
  });
}

async function handleSnapshot(req, res, userId) {
  const body = await readJsonBody(req);
  const now = new Date().toISOString();
  const device = normalizeDevice(body.device, userId);

  upsertDevice(userId, device, now);
  replaceDeviceActivity(userId, device.deviceId, body.tabs || [], now);
  replaceDeviceIntervals(userId, device.deviceId, body.intervals || [], now);

  db.snapshots.push({
    id: randomUUID(),
    userId,
    deviceId: device.deviceId,
    capturedAt: safeString(body.capturedAt) || now,
    receivedAt: now,
    tabCount: Array.isArray(body.tabs) ? body.tabs.length : 0,
    intervalCount: Array.isArray(body.intervals) ? body.intervals.length : 0,
  });
  db.snapshots = db.snapshots.slice(-500);

  await saveDb();

  sendJson(res, 200, {
    ok: true,
    syncedAt: now,
    ...buildActivityResponse(userId, new URLSearchParams()),
  });
}

async function verifyGoogleAccessToken(accessToken) {
  const tokenInfoResponse = await fetch(
    `${GOOGLE_TOKENINFO_URL}?access_token=${encodeURIComponent(accessToken)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!tokenInfoResponse.ok) {
    throw httpError(401, 'invalid_google_token', 'Google access token was rejected');
  }
  const tokenInfo = await tokenInfoResponse.json();

  if (GOOGLE_OAUTH_CLIENT_IDS.length > 0) {
    const tokenClientIds = [tokenInfo.aud, tokenInfo.azp].filter(Boolean);
    if (!tokenClientIds.some(clientId => GOOGLE_OAUTH_CLIENT_IDS.includes(clientId))) {
      throw httpError(401, 'invalid_google_audience', 'Google token was issued to another app');
    }
  }

  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw httpError(401, 'invalid_google_token', 'Google access token was rejected');
  }

  const userInfo = await response.json();
  if (tokenInfo.sub && userInfo.sub && tokenInfo.sub !== userInfo.sub) {
    throw httpError(401, 'google_subject_mismatch', 'Google token subject mismatch');
  }
  return userInfo;
}

function normalizeDevice(input, userId) {
  const deviceId = safeString(input?.deviceId);
  if (!deviceId) throw httpError(400, 'missing_device_id', 'device.deviceId is required');

  return {
    userId,
    deviceId,
    name: safeString(input?.name) || 'Unnamed device',
    browser: safeString(input?.browser) || 'Unknown browser',
    platform: safeString(input?.platform) || 'Unknown platform',
    extensionId: safeString(input?.extensionId) || '',
    extensionVersion: safeString(input?.extensionVersion) || '',
  };
}

function upsertDevice(userId, device, now) {
  const key = deviceKey(userId, device.deviceId);
  db.devices[key] = {
    ...db.devices[key],
    ...device,
    userId,
    createdAt: db.devices[key]?.createdAt || now,
    updatedAt: now,
    lastSeenAt: now,
  };
}

function replaceDeviceActivity(userId, deviceId, tabs, now) {
  for (const key of Object.keys(db.activity)) {
    const row = db.activity[key];
    if (row.userId === userId && row.deviceId === deviceId) delete db.activity[key];
  }

  if (!Array.isArray(tabs)) return;

  for (const tab of tabs) {
    const domain = safeString(tab?.url);
    if (!domain || !Array.isArray(tab?.days)) continue;

    for (const day of tab.days) {
      const date = safeString(day?.date);
      if (!isDateString(date)) continue;

      const incognito = tab?.incognito === true;
      const summaryTime = safeNumber(day?.summary);
      const sessions = safeNumber(day?.counter);
      if (summaryTime === 0 && sessions === 0) continue;

      const key = activityKey(userId, deviceId, date, domain, incognito);
      db.activity[key] = {
        userId,
        deviceId,
        date,
        domain,
        incognito,
        favicon: safeString(tab?.favicon),
        summaryTime,
        sessions,
        updatedAt: now,
      };
    }
  }
}

function replaceDeviceIntervals(userId, deviceId, intervals, now) {
  for (const key of Object.keys(db.intervals)) {
    const row = db.intervals[key];
    if (row.userId === userId && row.deviceId === deviceId) delete db.intervals[key];
  }

  if (!Array.isArray(intervals)) return;

  for (const interval of intervals) {
    const day = safeString(interval?.day);
    const domain = safeString(interval?.domain);
    if (!day || !domain || !Array.isArray(interval?.intervals)) continue;
    const incognito = interval?.incognito === true;

    db.intervals[intervalKey(userId, deviceId, day, domain, incognito)] = {
      userId,
      deviceId,
      day,
      domain,
      incognito,
      intervals: interval.intervals.map(safeString).filter(Boolean),
      updatedAt: now,
    };
  }
}

function buildAccountResponse(userId) {
  return {
    user: db.users[userId],
    devices: Object.values(db.devices)
      .filter(device => device.userId === userId)
      .sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt))),
  };
}

function buildActivityResponse(userId, searchParams) {
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const rows = Object.values(db.activity).filter(row => {
    if (row.userId !== userId) return false;
    if (from && row.date < from) return false;
    if (to && row.date > to) return false;
    return true;
  });

  const totals = {
    summaryTime: 0,
    sessions: 0,
    domains: 0,
    days: 0,
    devices: 0,
  };
  const domainMap = new Map();
  const dayMap = new Map();
  const deviceMap = new Map();
  const daySet = new Set();
  const deviceSet = new Set();

  for (const row of rows) {
    totals.summaryTime += row.summaryTime;
    totals.sessions += row.sessions;
    daySet.add(row.date);
    deviceSet.add(row.deviceId);

    const domain = domainMap.get(row.domain) || {
      domain: row.domain,
      favicon: row.favicon,
      summaryTime: 0,
      sessions: 0,
      devices: [],
    };
    domain.summaryTime += row.summaryTime;
    domain.sessions += row.sessions;
    if (row.favicon && !domain.favicon) domain.favicon = row.favicon;
    if (!domain.devices.includes(row.deviceId)) domain.devices.push(row.deviceId);
    domainMap.set(row.domain, domain);

    const day = dayMap.get(row.date) || {
      date: row.date,
      summaryTime: 0,
      sessions: 0,
      devices: [],
    };
    day.summaryTime += row.summaryTime;
    day.sessions += row.sessions;
    if (!day.devices.includes(row.deviceId)) day.devices.push(row.deviceId);
    dayMap.set(row.date, day);

    const device = deviceMap.get(row.deviceId) || {
      ...db.devices[deviceKey(userId, row.deviceId)],
      summaryTime: 0,
      sessions: 0,
      domains: 0,
      domainSet: new Set(),
    };
    device.summaryTime += row.summaryTime;
    device.sessions += row.sessions;
    device.domainSet.add(row.domain);
    device.domains = device.domainSet.size;
    deviceMap.set(row.deviceId, device);
  }

  totals.domains = domainMap.size;
  totals.days = daySet.size;
  totals.devices = deviceSet.size;

  const devices = [...deviceMap.values()]
    .map(({ domainSet, ...device }) => device)
    .sort((a, b) => b.summaryTime - a.summaryTime);

  return {
    generatedAt: new Date().toISOString(),
    totals,
    domains: [...domainMap.values()].sort((a, b) => b.summaryTime - a.summaryTime),
    days: [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    devices,
  };
}

function requireUser(req) {
  const header = req.headers.authorization || '';
  const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];
  if (!token) throw httpError(401, 'missing_session', 'Bearer session token is required');
  return verifySessionToken(token);
}

function signSessionToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };
  const unsigned = `${base64UrlJson(header)}.${base64UrlJson(fullPayload)}`;
  return `${unsigned}.${sign(unsigned)}`;
}

function verifySessionToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw httpError(401, 'invalid_session', 'Invalid session token');

  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`);
  if (!safeEqual(signature, expected)) {
    throw httpError(401, 'invalid_session', 'Invalid session signature');
  }

  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!parsed.userId || !db.users[parsed.userId]) {
    throw httpError(401, 'unknown_session_user', 'Session user does not exist');
  }
  if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
    throw httpError(401, 'expired_session', 'Session token expired');
  }
  return parsed;
}

function sign(value) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

async function readJsonBody(req) {
  let bytes = 0;
  const chunks = [];

  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) {
      throw httpError(413, 'body_too_large', 'Request body is too large');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError(400, 'invalid_json', 'Request body must be valid JSON');
  }
}

async function loadDb() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    return {
      ...emptyDb(),
      ...JSON.parse(await readFile(DATA_FILE, 'utf8')),
    };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const initialDb = emptyDb();
    await writeFile(DATA_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

async function saveDb() {
  await mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  await writeFile(tempFile, JSON.stringify(db, null, 2));
  await rename(tempFile, DATA_FILE);
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  if (
    origin.startsWith('chrome-extension://') ||
    origin.startsWith('moz-extension://') ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Vary', 'Origin');
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function safeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
}

function isDateString(value) {
  return /^\d{4}-\d{1,2}-\d{1,2}$/.test(value);
}

function deviceKey(userId, deviceId) {
  return `${userId}::${deviceId}`;
}

function activityKey(userId, deviceId, date, domain, incognito) {
  return `${userId}::${deviceId}::${date}::${incognito ? 'private' : 'normal'}::${domain}`;
}

function intervalKey(userId, deviceId, day, domain, incognito) {
  return `${userId}::${deviceId}::${day}::${incognito ? 'private' : 'normal'}::${domain}`;
}
