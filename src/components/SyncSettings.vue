<template>
  <div class="sync-page">
    <section class="sync-hero">
      <div>
        <p class="kicker">Sync</p>
        <h1>Account-wide activity</h1>
        <p class="sync-status">
          {{
            session
              ? `Signed in as ${session.user.email}`
              : 'Sign in once, then every browser and computer can contribute to one timeline.'
          }}
        </p>
      </div>
      <div class="sync-actions">
        <HeroButton v-if="!session" variant="primary" :disabled="isBusy" @click="connectGoogle()">
          <TablerIcon name="cloud" :size="18" />
          Continue with Google
        </HeroButton>
        <HeroButton v-if="session" variant="primary" :disabled="isBusy" @click="syncNow()">
          <TablerIcon name="upload" :size="18" />
          Sync this browser
        </HeroButton>
        <HeroButton v-if="session" variant="secondary" :disabled="isBusy" @click="loadCloud()">
          <TablerIcon name="download" :size="18" />
          Refresh cloud
        </HeroButton>
        <HeroButton v-if="session" variant="danger" :disabled="isBusy" @click="disconnect()">
          Sign out
        </HeroButton>
      </div>
    </section>

    <section v-if="errorMessage" class="sync-alert">
      {{ errorMessage }}
    </section>

    <section class="metric-grid">
      <article class="metric-card accent">
        <span :class="['chip', session ? 'success' : 'warning']">
          {{ session ? 'Connected' : 'Local only' }}
        </span>
        <p class="metric-label">Account</p>
        <p class="metric-value">{{ session?.user.name || 'Not signed in' }}</p>
      </article>
      <article class="metric-card">
        <span class="chip primary">All browsers</span>
        <p class="metric-label">Cloud time</p>
        <p class="metric-value">{{ formatDuration(cloudActivity?.totals.summaryTime || 0) }}</p>
      </article>
      <article class="metric-card">
        <span class="chip">{{ currentDevice.browser }}</span>
        <p class="metric-label">Synced devices</p>
        <p class="metric-value">{{ cloudActivity?.totals.devices || session?.devices.length || 0 }}</p>
      </article>
      <article class="metric-card">
        <span class="chip">Merged</span>
        <p class="metric-label">Tracked sites</p>
        <p class="metric-value">{{ cloudActivity?.totals.domains || 0 }}</p>
      </article>
    </section>

    <section class="settings-item device-panel">
      <div class="panel-header">
        <div>
          <p class="kicker">This install</p>
          <h2>{{ currentDevice.name }}</h2>
        </div>
        <div class="panel-actions">
          <span class="chip success">Current</span>
          <HeroButton variant="secondary" size="sm" :disabled="isBusy" @click="refreshDevice()">
            Reset name
          </HeroButton>
        </div>
      </div>

      <div class="device-form">
        <HeroInput label="Device name" v-model="deviceNameDraft" @change="saveDeviceName()" />
        <HeroInput label="Install identity" :model-value="currentDevice.deviceId" readonly />
        <HeroInput label="Last sync" :model-value="lastSyncLabel" readonly />
      </div>
    </section>

    <section class="sync-grid">
      <article class="settings-item sync-map">
        <div class="panel-header">
          <div>
            <p class="kicker">Devices</p>
            <h2>Browsers on this account</h2>
          </div>
        </div>
        <div class="record-list">
          <div v-if="deviceRows.length === 0" class="empty-row">No cloud devices yet.</div>
          <div class="record-row" v-for="device in deviceRows" :key="device.deviceId">
            <span class="record-dot"></span>
            <div>
              <p>{{ device.name }}</p>
              <span>
                {{ device.browser }} · {{ device.platform }} ·
                {{ formatDuration(device.summaryTime || 0) }}
              </span>
            </div>
          </div>
        </div>
      </article>

      <article class="settings-item sync-map">
        <div class="panel-header">
          <div>
            <p class="kicker">Activity</p>
            <h2>Top sites across everything</h2>
          </div>
        </div>
        <div class="record-list">
          <div v-if="topDomains.length === 0" class="empty-row">Sync to populate cloud activity.</div>
          <div class="record-row" v-for="domain in topDomains" :key="domain.domain">
            <span class="record-dot primary"></span>
            <div>
              <p>{{ domain.domain }}</p>
              <span>
                {{ formatDuration(domain.summaryTime) }} · {{ domain.sessions }} sessions ·
                {{ domain.devices.length }} devices
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SyncSettings',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import {
  fetchAccount,
  fetchCloudActivity,
  getStoredSession,
  signInWithGoogle,
  signOutOfSync,
  syncCurrentSnapshot,
} from '../backend/sync-api';
import { getSyncDevice, refreshSyncDeviceName, saveSyncDeviceName } from '../backend/device';
import { CloudActivity, SyncDevice, SyncSession } from '../backend/types';
import HeroButton from './HeroButton.vue';
import HeroInput from './HeroInput.vue';
import TablerIcon from './TablerIcon.vue';

const storage = injectStorage();

const currentDevice = reactive<SyncDevice>({
  deviceId: '',
  name: 'This computer',
  browser: 'Browser',
  platform: 'Unknown platform',
  extensionId: '',
  extensionVersion: '',
});
const deviceNameDraft = ref('This computer');
const lastSyncAt = ref('');
const session = ref<SyncSession | null>(null);
const cloudActivity = ref<CloudActivity | null>(null);
const isBusy = ref(false);
const errorMessage = ref('');

const topDomains = computed(() => cloudActivity.value?.domains.slice(0, 8) || []);
const deviceRows = computed(() => cloudActivity.value?.devices || session.value?.devices || []);
const lastSyncLabel = computed(() =>
  lastSyncAt.value ? new Date(lastSyncAt.value).toLocaleString() : 'Never synced',
);

onMounted(async () => {
  await loadLocalState();
  await loadSession();
});

async function loadLocalState() {
  Object.assign(currentDevice, await getSyncDevice());
  deviceNameDraft.value = currentDevice.name;
  lastSyncAt.value = await storage.getValue(StorageParams.SYNC_LAST_SYNC_AT, '');
}

async function loadSession() {
  session.value = await getStoredSession();
  if (!session.value) return;

  await runBusy(async () => {
    const account = await fetchAccount();
    session.value = {
      ...session.value!,
      user: account.user,
      devices: account.devices,
      currentDevice: account.currentDevice,
    };
    await loadCloud();
  });
}

async function connectGoogle() {
  await runBusy(async () => {
    session.value = await signInWithGoogle();
    cloudActivity.value = await syncCurrentSnapshot();
    lastSyncAt.value = await storage.getValue(StorageParams.SYNC_LAST_SYNC_AT, '');
  });
}

async function syncNow() {
  await runBusy(async () => {
    cloudActivity.value = await syncCurrentSnapshot();
    lastSyncAt.value = await storage.getValue(StorageParams.SYNC_LAST_SYNC_AT, '');
    const account = await fetchAccount();
    if (session.value) session.value.devices = account.devices;
  });
}

async function loadCloud() {
  cloudActivity.value = await fetchCloudActivity();
}

async function disconnect() {
  await runBusy(async () => {
    await signOutOfSync();
    session.value = null;
    cloudActivity.value = null;
  });
}

async function saveDeviceName() {
  Object.assign(currentDevice, await saveSyncDeviceName(deviceNameDraft.value));
  deviceNameDraft.value = currentDevice.name;
}

async function refreshDevice() {
  Object.assign(currentDevice, await refreshSyncDeviceName());
  deviceNameDraft.value = currentDevice.name;
}

async function runBusy(action: () => Promise<void>) {
  isBusy.value = true;
  errorMessage.value = '';
  try {
    await action();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sync action failed.';
  } finally {
    isBusy.value = false;
  }
}

function formatDuration(seconds: number) {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
</script>

<style scoped>
.sync-page {
  display: grid;
  gap: 18px;
  width: min(1120px, 100%);
}

.sync-hero,
.metric-card,
.device-panel,
.sync-map,
.sync-alert {
  border: 1px solid var(--hero-default-200);
  background: var(--hero-content1);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}

.sync-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 26px;
  background:
    linear-gradient(135deg, rgba(0, 111, 238, 0.13), rgba(23, 201, 100, 0.1)),
    var(--hero-content1);
}

.sync-alert {
  padding: 14px 16px;
  color: var(--hero-danger);
  background: var(--hero-danger-soft);
  font-size: 14px;
  font-weight: 750;
}

.kicker {
  margin: 0 0 8px;
  color: var(--hero-primary);
  font-size: 12px;
  font-weight: 850;
}

h1,
h2 {
  margin: 0;
  color: var(--hero-foreground);
  font-weight: 850;
  line-height: 1.1;
}

h1 {
  font-size: 32px;
}

h2 {
  font-size: 20px;
}

.sync-status {
  margin: 10px 0 0;
  color: var(--hero-default-500);
  font-size: 15px;
  font-weight: 650;
}

.sync-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.metric-grid,
.sync-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.sync-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-card {
  min-height: 142px;
  padding: 16px;
}

.metric-card.accent {
  background:
    linear-gradient(135deg, rgba(245, 165, 36, 0.12), rgba(0, 111, 238, 0.06)),
    var(--hero-content1);
}

.metric-label {
  margin: 18px 0 8px;
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 800;
}

.metric-value {
  margin: 0;
  color: var(--hero-foreground);
  font-size: 18px;
  font-weight: 850;
}

.chip {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: 999px;
  padding: 0 10px;
  color: var(--hero-default-700);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  font-size: 12px;
  font-weight: 850;
}

.chip.primary {
  color: var(--hero-primary);
  background: var(--hero-primary-soft);
  border-color: rgba(0, 111, 238, 0.22);
}

.chip.success {
  color: var(--hero-success);
  background: var(--hero-success-soft);
  border-color: rgba(23, 201, 100, 0.22);
}

.chip.warning {
  color: var(--hero-warning);
  background: var(--hero-warning-soft);
  border-color: rgba(245, 165, 36, 0.24);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.device-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.record-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.record-row,
.empty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
}

.empty-row {
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 750;
}

.record-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--hero-success);
  box-shadow: 0 0 0 4px var(--hero-success-soft);
}

.record-dot.primary {
  background: var(--hero-primary);
  box-shadow: 0 0 0 4px var(--hero-primary-soft);
}

.record-row p {
  margin: 0 0 4px;
  color: var(--hero-foreground);
  font-weight: 850;
}

.record-row span {
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 650;
}

@media (max-width: 1020px) {
  .metric-grid,
  .sync-grid,
  .device-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .sync-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .sync-actions {
    justify-content: flex-start;
  }

  .metric-grid,
  .sync-grid,
  .device-form {
    grid-template-columns: 1fr;
  }
}
</style>
