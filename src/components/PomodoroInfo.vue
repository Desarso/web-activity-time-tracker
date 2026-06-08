<template>
  <div class="pomodoro-popup-block" v-if="isEnabled">
    <p>{{ t('pomodoroIsEnabled.message') }}</p>
    <span v-if="isWorkingTime">{{ t('pomodoroWork.message') }}</span>
    <span v-if="!isWorkingTime">{{ t('pomodoroRest.message') }}</span>
    <input
      type="button"
      :value="t('pomodoroSettings.message')"
      @click="openPage(SettingsTab.Pomodoro)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'PomodoroInfo',
};
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { StorageParams, IS_POMODORO_ENABLED_DEFAULT } from '../storage/storage-params';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { openPage } from '../utils/open-page';
import { SettingsTab } from '../utils/enums';
import { checkPomodoro } from '../functions/pomodoro';

const { t } = useI18n();
const settingsStorage = injectStorage();

const isEnabled = ref<boolean>();
const isWorkingTime = ref<boolean>();

onMounted(async () => {
  isEnabled.value = await settingsStorage.getValue(
    StorageParams.IS_POMODORO_ENABLED,
    IS_POMODORO_ENABLED_DEFAULT,
  );

  isWorkingTime.value = (await checkPomodoro())?.isWork;
});
</script>

<style scoped>
.pomodoro-popup-block {
  width: calc(100% - 24px);
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  padding: 12px 14px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-md);
  backdrop-filter: blur(12px);
}
.pomodoro-popup-block p {
  display: inline-block;
  margin: 9px 8px;
  color: var(--hero-foreground);
  font-size: 15px;
  font-weight: 850;
}
.pomodoro-popup-block span {
  padding: 6px 10px;
  background-color: var(--hero-success-soft);
  border: 1px solid rgba(23, 201, 100, 0.22);
  color: var(--hero-success);
  margin-left: 5px;
  border-radius: 999px;
  font-weight: 850;
  font-size: 13px;
}
.pomodoro-popup-block input[type='button'] {
  float: right;
}
</style>
