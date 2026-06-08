<template>
  <div :class="['sync-account-actions', { compact }]">
    <button
      v-if="!session"
      class="sync-button primary"
      :disabled="isBusy"
      @click="connectGoogle()"
    >
      <TablerIcon name="login" :size="iconSize" />
      <span>{{ compact ? 'Sign in' : 'Sign in with Google' }}</span>
    </button>
    <template v-else>
      <button class="sync-button account" :disabled="isBusy" @click="openPage(SettingsTab.Sync)">
        <TablerIcon name="user-circle" :size="iconSize" />
        <span>{{ compact ? session.user.email.split('@')[0] : session.user.email }}</span>
      </button>
      <button class="sync-button secondary" :disabled="isBusy" @click="disconnect()">
        <TablerIcon name="logout" :size="iconSize" />
        <span>{{ compact ? 'Out' : 'Sign out' }}</span>
      </button>
    </template>
    <p v-if="errorMessage && !compact" class="sync-error">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SyncAccountActions',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { getStoredSession, signInWithGoogle, signOutOfSync } from '../backend/sync-api';
import { SyncSession } from '../backend/types';
import { SettingsTab } from '../utils/enums';
import { openPage } from '../utils/open-page';
import TablerIcon from './TablerIcon.vue';

const props = withDefaults(
  defineProps<{
    compact?: boolean;
    goToSyncAfterSignIn?: boolean;
  }>(),
  {
    compact: false,
    goToSyncAfterSignIn: true,
  },
);

const emit = defineEmits<{
  (event: 'signedIn', session: SyncSession): void;
  (event: 'signedOut'): void;
}>();

const session = ref<SyncSession | null>(null);
const isBusy = ref(false);
const errorMessage = ref('');
const iconSize = computed(() => (props.compact ? 16 : 18));

onMounted(async () => {
  session.value = await getStoredSession();
});

async function connectGoogle() {
  isBusy.value = true;
  errorMessage.value = '';
  try {
    session.value = await signInWithGoogle();
    emit('signedIn', session.value);
    if (props.goToSyncAfterSignIn) await openPage(SettingsTab.Sync);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Google sign-in failed.';
  } finally {
    isBusy.value = false;
  }
}

async function disconnect() {
  isBusy.value = true;
  errorMessage.value = '';
  try {
    await signOutOfSync();
    session.value = null;
    emit('signedOut');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sign out failed.';
  } finally {
    isBusy.value = false;
  }
}
</script>

<style scoped>
.sync-account-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sync-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--hero-radius-md, 12px);
  padding: 0 16px;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
}

.sync-button.primary {
  color: #fff;
  background: var(--hero-primary, #006fee);
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.24);
}

.sync-button.secondary,
.sync-button.account {
  color: var(--hero-foreground, #11181c);
  background: var(--hero-default-100, #f4f4f5);
  border: 1px solid var(--hero-default-200, #e4e4e7);
  box-shadow: none;
}

.sync-button.secondary {
  color: var(--hero-danger, #f31260);
}

.sync-button:disabled {
  color: var(--hero-default-400, #a1a1aa);
  background: var(--hero-default-100, #f4f4f5);
  box-shadow: none;
  cursor: not-allowed;
}

.sync-error {
  flex-basis: 100%;
  margin: 0;
  color: var(--hero-danger, #f31260);
  font-size: 13px;
  font-weight: 750;
}

.sync-account-actions.compact {
  gap: 6px;
}

.sync-account-actions.compact .sync-button {
  min-height: 34px;
  padding: 0 10px;
  font-size: 12px;
}
</style>
