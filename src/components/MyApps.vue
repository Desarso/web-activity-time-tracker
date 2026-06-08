<template>
  <div class="main">
    <p class="header">{{ t('tryMyOtherApps.message') }}</p>
    <div class="app-block" @click="openAppLink(App.ClearYoutube)">
      <div class="img-block">
        <img src="../assets/icons/clear-youtube-logo.svg" height="45" />
      </div>
      <div>
        <p class="title">{{ t('clearYoutube.message') }}</p>
        <p class="description">
          {{ t('clearYoutube.description') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MyApps',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { CHROME_STORE_CLEAR_YOUTUBE_URL } from '../utils/chrome-url';
const { t } = useI18n();

enum App {
  ClearYoutube,
}

function openAppLink(app: App) {
  switch (app) {
    case App.ClearYoutube:
      window.open(CHROME_STORE_CLEAR_YOUTUBE_URL, '_blank');
      break;
  }
}
</script>

<style scoped>
.main {
  margin-top: 28px;
}
.header {
  color: var(--hero-default-500);
  font-size: 16px;
  font-weight: 850;
  text-transform: uppercase;
}
.app-block {
  margin: 20px 0;
  padding: 16px 18px;
  font-size: 14px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 20px;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}
.app-block:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 111, 238, 0.26);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}
.app-block .img-block {
  margin: auto 0;
}
.title {
  margin: 0;
  color: var(--hero-foreground);
  font-weight: 850;
  font-size: 16px;
}
.description {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--hero-default-500);
  line-height: 1.5;
}
img {
  margin: auto;
}
</style>
