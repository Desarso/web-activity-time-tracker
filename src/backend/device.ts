import Browser from 'webextension-polyfill';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import { SyncDevice } from './types';

const storage = injectStorage();

export async function getSyncDevice(): Promise<SyncDevice> {
  let deviceId = await storage.getValue(StorageParams.SYNC_DEVICE_ID, '');
  if (!deviceId) {
    deviceId = createDeviceId();
    await storage.saveValue(StorageParams.SYNC_DEVICE_ID, deviceId);
  }

  let name = await storage.getValue(StorageParams.SYNC_DEVICE_NAME, '');
  if (!name) {
    name = defaultDeviceName();
    await storage.saveValue(StorageParams.SYNC_DEVICE_NAME, name);
  }

  return {
    deviceId,
    name,
    browser: browserName(),
    platform: platformName(),
    extensionId: __APP_ID__,
    extensionVersion: Browser.runtime.getManifest().version,
  };
}

export async function saveSyncDeviceName(name: string): Promise<SyncDevice> {
  const cleanedName = name.trim() || defaultDeviceName();
  await storage.saveValue(StorageParams.SYNC_DEVICE_NAME, cleanedName);
  return getSyncDevice();
}

export async function refreshSyncDeviceName(): Promise<SyncDevice> {
  await storage.saveValue(StorageParams.SYNC_DEVICE_NAME, defaultDeviceName());
  return getSyncDevice();
}

export function createDeviceId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function browserName() {
  const agent = navigator.userAgent;
  if (agent.includes('Edg/')) return 'Edge';
  if (agent.includes('Firefox/')) return 'Firefox';
  if (agent.includes('Chrome/')) return 'Chrome';
  if (agent.includes('Safari/')) return 'Safari';
  return __BROWSER__ || 'Browser';
}

export function platformName() {
  return navigator.platform || 'Unknown platform';
}

function defaultDeviceName() {
  return `${browserName()} on ${platformName()}`;
}
