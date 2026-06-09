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
  const googleClientId = getGoogleExtensionClientId();
  let chromeAuthError: unknown;

  if (isPlaceholderGoogleClientId(googleClientId)) {
    throw new Error(getGoogleOAuthSetupMessage('Chrome sign-in'));
  }

  if (identity?.getAuthToken) {
    try {
      const tokenResult = await identity.getAuthToken({
        interactive: true,
        scopes: GOOGLE_SCOPES,
      });
      const accessToken = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
      if (accessToken) return accessToken;
    } catch (error) {
      chromeAuthError = error;
    }
  }

  if (!identity?.launchWebAuthFlow || !identity?.getRedirectURL) {
    if (chromeAuthError) throw normalizeGoogleAuthError(chromeAuthError);
    throw new Error('This browser does not expose an extension identity API.');
  }

  const webClientId = getGoogleWebClientId();
  if (isPlaceholderGoogleClientId(webClientId)) {
    if (chromeAuthError) throw normalizeGoogleAuthError(chromeAuthError);
    throw new Error(getGoogleOAuthSetupMessage('Brave sign-in'));
  }

  const redirectUri = identity.getRedirectURL('google');
  const state = createOAuthState();
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', webClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES.join(' '));
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('state', state);

  const redirectUrl = await identity.launchWebAuthFlow({
    interactive: true,
    url: authUrl.toString(),
  });
  const redirectHash = new URL(redirectUrl).hash.slice(1);
  const redirectParams = new URLSearchParams(redirectHash);
  if (redirectParams.get('state') !== state) throw new Error('Google sign-in returned an invalid state.');
  const accessToken = redirectParams.get('access_token');

  if (!accessToken) throw new Error('Google did not return an access token.');
  return accessToken;
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

function getGoogleExtensionClientId(): string {
  return String((Browser.runtime.getManifest() as { oauth2?: { client_id?: string } }).oauth2?.client_id || '');
}

function getGoogleWebClientId(): string {
  return String(import.meta.env.VITE_GOOGLE_WEB_OAUTH_CLIENT_ID || '');
}

function isPlaceholderGoogleClientId(clientId: string): boolean {
  return !clientId || clientId.startsWith('REPLACE_WITH_') || clientId.includes('your-client-id');
}

function getGoogleOAuthSetupMessage(flowName = 'Google sign-in'): string {
  const redirectUri = `https://${getExtensionId()}.chromiumapp.org/google`;
  return `${flowName} needs Google OAuth configured for extension ID ${getExtensionId()}. Set VITE_GOOGLE_OAUTH_CLIENT_ID for Chrome. For Brave, also set VITE_GOOGLE_WEB_OAUTH_CLIENT_ID to a Web client that allows redirect URI ${redirectUri}. Include every client ID in GOOGLE_OAUTH_CLIENT_IDS for the backend, rebuild, and reload the extension.`;
}

function createOAuthState(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function normalizeGoogleAuthError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error || '');
  if (/bad client id|invalid_client|oauth2 request failed/i.test(message)) {
    return new Error(getGoogleOAuthSetupMessage());
  }
  return error instanceof Error ? error : new Error(message || 'Google sign-in failed.');
}

function getExtensionId(): string {
  return String((Browser.runtime as typeof Browser.runtime & { id?: string }).id || 'this extension');
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

  const apiBaseUrl = await getSyncApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Cannot reach sync backend at ${apiBaseUrl}. Start the backend, then try again.`);
  }

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.message || json?.error || `Request failed with ${response.status}`);
  }
  return json as T;
}
