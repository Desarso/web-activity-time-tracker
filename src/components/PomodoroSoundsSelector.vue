<template>
  <p class="title-audio d-inline-block">{{ t('pomodoroSoundAfter.message') }}</p>
  <HeroSelect
    class="sound-select"
    v-model="audioAfterPeriod"
    :options="soundOptions"
    :aria-label="t('pomodoroSoundAfter.message')"
    @change="onAudioChange"
  />
  <button class="play" type="button" @click="playAudio" :aria-label="t('clickToPreview.message')">
    <TablerIcon name="player-play" :size="18" />
  </button>
  <span class="preview">{{ t('clickToPreview.message') }}</span>
</template>

<script lang="ts">
export default {
  name: 'PomodoroSoundsSelector',
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PomodoroAudioParams, PomodoroSounds } from '../utils/pomodoro';
import { injectStorage } from '../storage/inject-storage';
import { playSound } from '../functions/playSound';
import HeroSelect, { HeroSelectValue } from './HeroSelect.vue';
import TablerIcon from './TablerIcon.vue';

const props = defineProps<{
  option: PomodoroAudioParams;
  value: PomodoroSounds;
}>();

const { t } = useI18n();
const settingsStorage = injectStorage();
const audioAfterPeriod = ref<PomodoroSounds>(props.value);
const soundOptions = computed(() =>
  Object.values(PomodoroSounds).map((value, index) => ({
    value,
    label: `${t('sound.message')} ${index + 1}`,
  })),
);

function playAudio() {
  playSound(audioAfterPeriod.value);
}

async function onAudioChange(value: HeroSelectValue) {
  await settingsStorage.saveValue(props.option, value);
}
</script>

<style scoped>
.play {
  display: inline-block;
  cursor: pointer;
  margin-left: 10px;
  padding: 7px;
  color: var(--hero-success);
  background: var(--hero-success-soft);
  border: 1px solid rgba(23, 201, 100, 0.22);
  border-radius: 999px;
  vertical-align: middle;
}
.title-audio {
  color: var(--hero-default-500);
  font-size: 15px;
  font-weight: 800;
}
.preview {
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 700;
}
.sound-select {
  width: 190px;
  margin-left: 15px;
}
</style>
