import Browser from 'webextension-polyfill';
import { TimeInterval } from '../entity/time-interval';
import { Tab } from '../entity/tab';
import { injectStorage } from '../storage/inject-storage';
import {
  StorageDeserializeParam,
  StorageParams,
  SYNC_API_BASE_URL_DEFAULT,
} from '../storage/storage-params';
import { getSyncDevice } from './device';
import { CloudActivity, SyncAccount, SyncSession, SyncSnapshot, SyncUser } from './types';

type GoogleAuthTokenResult = string | { token?: string } | undefined;
type IdentityWithGoogleAuth = typeof Browser.identity & {
  getAuthToken?: (details: {
    interactive?: boolean;
    scopes?: string[];
  }) => Promise<GoogleAuthTokenResult>;
  clearAllCachedAuthTokens?: () => Promise<void>;
};

const GOOGLE_SCOPES = ['openid', 'email', 'profile'];
const storage = injectStorage();

export async function getStoredSession(): Promise<SyncSession | null> {
  const token = await storage.getValue(StorageParams.SYNC_SESSION_TOKEN, '');
  const user = (await storage.getValue(StorageParams.SYNC_USER, null)) as SyncUser | null;
  if (!token || !user) return null;
  return {
    token,
    user,
    devices: [],
  };
}

export async function signInWithGoogle(): Promise<SyncSession> {
  const accessToken = await getGoogleAccessToken();

  const session = await requestJson<SyncSession>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      accessToken,
      device: await getSyncDevice(),
    }),
  });

  await saveSession(session);
  return session;
}

async function getGoogleAccessToken(): Promise<string> {
  const identity = Browser.identity as IdentityWithGoogleAuth;

  if (identity?.getAuthToken) {
    const tokenResult = await identity.getAuthToken({
      interactive: true,
      scopes: GOOGLE_SCOPES,
    });
    const accessToken = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
    if (accessToken) return accessToken;
  }

  if (!identity?.launchWebAuthFlow || !identity?.getRedirectURL) {
    throw new Error('This browser does not expose an extension identity API.');
  }

  const googleClientId = getGoogleClientId();
  if (!googleClientId || googleClientId.startsWith('REPLACE_WITH_')) {
    throw new Error('Configure the Google OAuth client ID in src/manifest.json before signing in.');
  }

  const redirectUri = identity.getRedirectURL('google');
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', googleClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES.join(' '));
  authUrl.searchParams.set('prompt', 'select_account');

  const redirectUrl = await identity.launchWebAuthFlow({
    interactive: true,
    url: authUrl.toString(),
  });
  const accessToken = new URL(redirectUrl).hash
    .slice(1)
    .split('&')
    .map(part => part.split('='))
    .find(([key]) => key === 'access_token')?.[1];

  if (!accessToken) throw new Error('Google did not return an access token.');
  return decodeURIComponent(accessToken);
}

export async function signOutOfSync(): Promise<void> {
  const identity = Browser.identity as IdentityWithGoogleAuth;
  if (identity?.clearAllCachedAuthTokens) await identity.clearAllCachedAuthTokens();

  await storage.saveValue(StorageParams.SYNC_SESSION_TOKEN, '');
  await storage.saveValue(StorageParams.SYNC_USER, null);
  await storage.saveValue(StorageParams.SYNC_ENABLED, false);
  await storage.saveValue(StorageParams.SYNC_LAST_SYNC_AT, '');
}

export async function saveSession(session: SyncSession): Promise<void> {
  await storage.saveValue(StorageParams.SYNC_SESSION_TOKEN, session.token);
  await storage.saveValue(StorageParams.SYNC_USER, session.user);
  await storage.saveValue(StorageParams.SYNC_ENABLED, true);
}

export async function fetchAccount(): Promise<SyncAccount> {
  return requestJson<SyncAccount>('/api/me', {
    method: 'GET',
    auth: true,
  });
}

export async function syncCurrentSnapshot(): Promise<CloudActivity> {
  const snapshot = await buildSnapshot();
  const activity = await requestJson<CloudActivity>('/api/sync/snapshot', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(snapshot),
  });

  await storage.saveValue(StorageParams.SYNC_LAST_SYNC_AT, new Date().toISOString());
  return activity;
}

export async function fetchCloudActivity(): Promise<CloudActivity> {
  return requestJson<CloudActivity>('/api/activity', {
    method: 'GET',
    auth: true,
  });
}

export async function getSyncApiBaseUrl(): Promise<string> {
  const configured = await storage.getValue(
    StorageParams.SYNC_API_BASE_URL,
    import.meta.env.VITE_SYNC_API_BASE_URL || SYNC_API_BASE_URL_DEFAULT,
  );
  return String(configured || SYNC_API_BASE_URL_DEFAULT).replace(/\/$/, '');
}

async function buildSnapshot(): Promise<SyncSnapshot> {
  return {
    device: await getSyncDevice(),
    tabs: (await storage.getDeserializeList(StorageDeserializeParam.TABS)) as Tab[],
    intervals: (await storage.getDeserializeList(
      StorageDeserializeParam.TIMEINTERVAL_LIST,
    )) as TimeInterval[],
    capturedAt: new Date().toISOString(),
  };
}

function getGoogleClientId(): string {
  return String((Browser.runtime.getManifest() as { oauth2?: { client_id?: string } }).oauth2?.client_id || '');
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { auth?: boolean },
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = await storage.getValue(StorageParams.SYNC_SESSION_TOKEN, '');
    if (!token) throw new Error('Sign in before syncing.');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${await getSyncApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.message || json?.error || `Request failed with ${response.status}`);
  }
  return json as T;
}
