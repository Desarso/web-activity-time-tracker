import { injectStorage } from '../storage/inject-storage';
import { StorageParams, SYNC_ENABLED_DEFAULT } from '../storage/storage-params';
import { syncCurrentSnapshot } from './sync-api';

const SYNC_INTERVAL_MS = 60 * 1000;
const storage = injectStorage();

let lastSyncStartedAt = 0;
let isSyncing = false;

export async function syncSnapshotIfEnabled(): Promise<void> {
  if (isSyncing || Date.now() - lastSyncStartedAt < SYNC_INTERVAL_MS) return;

  const [enabled, token] = await Promise.all([
    storage.getValue(StorageParams.SYNC_ENABLED, SYNC_ENABLED_DEFAULT),
    storage.getValue(StorageParams.SYNC_SESSION_TOKEN, ''),
  ]);
  if (!enabled || !token) return;

  isSyncing = true;
  lastSyncStartedAt = Date.now();

  try {
    await syncCurrentSnapshot();
  } catch (error) {
    console.warn('Background sync failed', error);
  } finally {
    isSyncing = false;
  }
}
