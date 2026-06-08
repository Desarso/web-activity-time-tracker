<template>
  <p class="title mt-0">{{ t('pomodoro.message') }}</p>
  <p class="description">
    {{ t('pomodoro.description') }}
  </p>
  <div class="explanation-block">
    <p class="explanation">
      {{ t('pomodoroExplanationIcon.message') }}
      <span class="inline-status-icon work"><TablerIcon name="clock-play" :size="18" /></span>.
      {{ t('pomodoroExplanationIcon.description') }}
      <span class="inline-status-icon rest"><TablerIcon name="hourglass-empty" :size="18" /></span>.
    </p>
    <p class="explanation">
      {{ t('pomodoroExplanationTime.message') }}
    </p>
    <p class="explanation">{{ t('pomodoroExplanationStop.message') }}</p>
  </div>
  <div :class="isEnabled ? 'disabled' : ''">
    <div class="pomodoro-block mt-20">
      <p class="title">{{ t('pomodoroWork.message') }}</p>
      <VueDatePicker v-model="workTime" time-picker class="date-picker" />
    </div>
    <div class="pomodoro-block">
      <PomodoroSoundsSelector
        v-if="audioAfterWork"
        :option="StorageParams.POMODORO_AUDIO_AFTER_WORK"
        :value="audioAfterWork"
      />
    </div>
    <div class="pomodoro-block">
      <p class="title">{{ t('pomodoroRest.message') }}</p>
      <VueDatePicker v-model="restTime" time-picker class="date-picker" />
    </div>
    <div class="pomodoro-block">
      <PomodoroSoundsSelector
        v-if="audioAfterRest"
        :option="StorageParams.POMODORO_AUDIO_AFTER_REST"
        :value="audioAfterRest"
      />
    </div>
    <div class="pomodoro-block">
      <p class="title">{{ t('pomodoroFrequency.message') }}</p>
      <input type="number" class="frequency" v-model="frequency" />
    </div>
    <div class="pomodoro-block">
      <PomodoroSoundsSelector
        v-if="audioAfterFinished"
        :option="StorageParams.POMODORO_AUDIO_AFTER_FINISHED"
        :value="audioAfterFinished"
      />
    </div>
  </div>
  <button
    class="d-inline-block mt-15"
    :class="[isEnabled ? 'stop' : 'start', isDisabled ? 'disabled' : '']"
    @click="changeStatus()"
  >
    <TablerIcon v-if="isEnabled" name="player-stop" :size="20" />
    <TablerIcon v-if="!isEnabled" name="player-play" :size="20" />
    {{ !isEnabled ? t('start.message') : t('stop.message') }}
  </button>
</template>

<script lang="ts">
export default {
  name: 'Pomodoro',
};
</script>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref } from 'vue';
import { convertHHMMToSeconds, convertSecondsToHHMM } from '../utils/converter';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import {
  IS_POMODORO_ENABLED_DEFAULT,
  POMODORO_AUDIO_AFTER_FINISHED_DEFAULT,
  POMODORO_AUDIO_AFTER_REST_DEFAULT,
  POMODORO_AUDIO_AFTER_WORK_DEFAULT,
  POMODORO_FREQUENCY_DEFAULT,
  POMODORO_INTERVAL_REST_DEFAULT,
  POMODORO_INTERVAL_WORK_DEFAULT,
  StorageParams,
} from '../storage/storage-params';
import { Time } from '../utils/time';
import { logger } from '../utils/logger';
import { useBadge, BadgeColor, BadgeIcon } from '../functions/useBadge';
import { PomodoroSounds } from '../utils/pomodoro';
import PomodoroSoundsSelector from '../components/PomodoroSoundsSelector.vue';
import Browser from 'webextension-polyfill';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();
const settingsStorage = injectStorage();

const workTime = ref<Time>({
  hours: 0,
  minutes: 25,
});
const restTime = ref<Time>({
  hours: 0,
  minutes: 5,
});
const frequency = ref<number>(3);
const isEnabled = ref<boolean>();
const audioAfterWork = ref<PomodoroSounds>();
const audioAfterRest = ref<PomodoroSounds>();
const audioAfterFinished = ref<PomodoroSounds>();
const isDisabled = computed(
  () => frequency.value <= 0 || timeIsEmpty(workTime) || timeIsEmpty(restTime),
);

onMounted(async () => {
  isEnabled.value = await settingsStorage.getValue(
    StorageParams.IS_POMODORO_ENABLED,
    IS_POMODORO_ENABLED_DEFAULT,
  );
  workTime.value = convertSecondsToHHMM(
    await settingsStorage.getValue(
      StorageParams.POMODORO_INTERVAL_WORK,
      POMODORO_INTERVAL_WORK_DEFAULT,
    ),
  );
  restTime.value = convertSecondsToHHMM(
    await settingsStorage.getValue(
      StorageParams.POMODORO_INTERVAL_REST,
      POMODORO_INTERVAL_REST_DEFAULT,
    ),
  );
  frequency.value = await settingsStorage.getValue(
    StorageParams.POMODORO_FREQUENCY,
    POMODORO_FREQUENCY_DEFAULT,
  );

  audioAfterWork.value = await settingsStorage.getValue(
    StorageParams.POMODORO_AUDIO_AFTER_WORK,
    POMODORO_AUDIO_AFTER_WORK_DEFAULT,
  );

  audioAfterRest.value = await settingsStorage.getValue(
    StorageParams.POMODORO_AUDIO_AFTER_REST,
    POMODORO_AUDIO_AFTER_REST_DEFAULT,
  );

  audioAfterFinished.value = await settingsStorage.getValue(
    StorageParams.POMODORO_AUDIO_AFTER_FINISHED,
    POMODORO_AUDIO_AFTER_FINISHED_DEFAULT,
  );
});

function timeIsEmpty(time: Ref<Time | undefined>) {
  return time.value == undefined || (time.value.hours == 0 && time.value.minutes == 0);
}

async function changeStatus() {
  await settingsStorage.saveValue(StorageParams.IS_POMODORO_ENABLED, !isEnabled.value);
  await settingsStorage.saveValue(
    StorageParams.POMODORO_INTERVAL_WORK,
    convertHHMMToSeconds(workTime.value.hours, workTime.value.minutes),
  );
  await settingsStorage.saveValue(
    StorageParams.POMODORO_INTERVAL_REST,
    convertHHMMToSeconds(restTime.value.hours, restTime.value.minutes),
  );
  await settingsStorage.saveValue(StorageParams.POMODORO_START_TIME, new Date().toString());
  await settingsStorage.saveValue(StorageParams.POMODORO_FREQUENCY, frequency.value);

  isEnabled.value = !isEnabled.value;

  if (isEnabled.value)
    await useBadge({
      text: null,
      color: BadgeColor.none,
      icon: BadgeIcon.pomodoroWorkingTime,
    });
  else {
    await settingsStorage.saveValue(StorageParams.POMODORO_START_TIME, null);
    await useBadge({
      text: null,
      color: BadgeColor.none,
      icon: BadgeIcon.default,
    });
  }

  logger.log(`Change pomodoro status to ${String(isEnabled.value).toUpperCase()}`);
}

function playAudio(sound: PomodoroSounds) {
  const myAudio = new Audio(Browser.runtime.getURL(`assets/pomodoro-sounds/${sound}`));
  myAudio.play();
}
</script>

<style scoped>
.pomodoro-block {
  display: flex;
  justify-content: start;
  align-items: center;
  min-height: 54px;
  padding: 8px 0;
}
.date-picker {
  width: 120px;
  margin: 0 15px;
  vertical-align: center;
  padding: 10px 0;
}
.frequency {
  width: 50px;
  padding: 5px 10px;
  height: 20px;
  margin: auto 0;
  margin-left: 15px;
}
.blocked {
  display: inline-block;
  font-size: 13px;
  color: var(--hero-default-500);
  margin-left: 55px;
  margin-top: 5px;
}

.inline-status-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  border-radius: var(--hero-radius-md);
  vertical-align: middle;
}

.inline-status-icon.work {
  background: var(--hero-primary-50);
  color: var(--hero-primary);
}

.inline-status-icon.rest {
  background: rgba(45, 212, 191, 0.14);
  color: var(--hero-success);
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  color: #fff;
  border-radius: var(--hero-radius-md);
  min-height: 42px;
  line-height: 42px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-width: 80px;
  text-align: center;
  width: 200px;
  box-shadow: var(--hero-shadow-sm);
}
button.start {
  background-color: var(--hero-success) !important;
}
button.stop {
  background-color: var(--hero-danger) !important;
}
.explanation-block {
  margin: 10px 0;
  padding: 15px;
  background-color: var(--hero-primary-soft);
  border: 1px solid rgba(0, 111, 238, 0.18);
  border-radius: var(--hero-radius-lg);
}
.explanation-block .explanation {
  font-size: 15px;
  color: var(--hero-foreground);
  line-height: 1.5;
}
.disabled {
  border-radius: var(--hero-radius-lg);
  pointer-events: none;
  opacity: 0.5;
}
</style>
