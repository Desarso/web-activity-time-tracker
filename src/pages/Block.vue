<template>
  <div class="block-page">
    <div class="block-container">
    <div class="brand">
      <span class="brand-icon"><TablerIcon name="stopwatch" :size="34" :stroke="2.2" /></span>
      <div>
        <p class="brand-kicker">{{ t('limit.message') }}</p>
        <p class="brand-title">Web Activity Time Tracker</p>
      </div>
    </div>
    <p class="block-message">
      {{ t('block.message') }}
    </p>
    <div class="site-card">
      <img class="favicon" height="35" :src="favicon" />
      <span>{{ webSite }}</span>
    </div>
    <p class="source-url">{{ sourceUrl }}</p>
    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-label">{{ t('limit.message') }}</p>
        <p class="stat-value">{{ limitTimeString }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">{{ t('sessions.message') }}</p>
        <p class="stat-value">{{ summaryCounter }}</p>
      </div>
    </div>
    <input
      v-if="allowDeferringBlock && haveToShowDeffering"
      type="button"
      class="mt-20"
      :value="t('5mins.message')"
      @click="deferring()"
    />
    <p class="desctiption">{{ t('deferringDescription.message') }}</p>
    <PromoClearYouTube />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getValueFromQuery } from '../utils/block-page';
import { injectStorage } from '../storage/inject-storage';
import { BLOCK_DEFERRAL_DEFAULT, StorageParams } from '../storage/storage-params';
import { convertLimitTimeToString } from '../utils/converter';
import PromoClearYouTube from '../components/PromoClearYouTube.vue';
import { canDefering, defering } from '../functions/deferList';
import TablerIcon from '../components/TablerIcon.vue';

const { t } = useI18n();

const settingsStorage = injectStorage();

const webSite = ref<string>();
const sourceUrl = ref<string>();
const limitTime = ref<number>();
const favicon = ref<string>();
const limitTimeString = ref<string>();
const summaryCounter = ref<number>();
const allowDeferringBlock = ref<boolean>();
const haveToShowDeffering = ref<boolean>();

onMounted(async () => {
  const queryObj = getValueFromQuery(location.href);
  webSite.value = queryObj.domain ?? '';
  sourceUrl.value = queryObj.url ?? '';
  limitTime.value = queryObj.limitTime;
  favicon.value = queryObj.favicon ?? '';
  limitTimeString.value = convertLimitTimeToString(queryObj.limitTime);
  summaryCounter.value = queryObj.summaryCounter ?? 0;

  allowDeferringBlock.value = await settingsStorage.getValue(
    StorageParams.BLOCK_DEFERRAL,
    BLOCK_DEFERRAL_DEFAULT,
  );
  haveToShowDeffering.value = await canDefering(webSite.value);
});

async function deferring() {
  if (
    webSite.value != undefined &&
    limitTime.value != undefined &&
    allowDeferringBlock.value &&
    haveToShowDeffering.value
  ) {
    await defering(webSite.value, 5);
    if (sourceUrl.value) window.location.replace(sourceUrl.value);
  }
}
</script>

<style scoped>
.block-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  color: var(--hero-foreground);
  background:
    radial-gradient(circle at 50% 0%, rgba(243, 18, 96, 0.12), transparent 36%),
    linear-gradient(180deg, #fff 0%, var(--hero-background) 52%);
}

.block-container {
  width: min(560px, 100%);
  text-align: center;
  padding: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--hero-default-200);
  border-radius: 22px;
  box-shadow: var(--hero-shadow-md);
  backdrop-filter: blur(12px);
}

.block-container p {
  font-size: 16px;
}

.block-container span {
  font-weight: 800;
  font-size: 21px;
  vertical-align: top;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  margin-bottom: 12px;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: var(--hero-primary);
  background: var(--hero-primary-soft);
  border: 1px solid rgba(0, 111, 238, 0.18);
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.18);
}

.brand-kicker {
  margin: 0 0 4px;
  color: var(--hero-danger);
  font-size: 12px !important;
  font-weight: 800;
}

.brand-title {
  margin: 0;
  color: var(--hero-foreground);
  font-size: 20px !important;
  font-weight: 850;
}

.block-message {
  color: var(--hero-default-500);
  line-height: 1.55;
}
.stats {
  display: flex;
  flex-direction: column;
}
.stats p {
  display: inline-block;
  width: 100px;
}
.site-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 12px 16px;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0 4px;
}

.stat-card {
  padding: 14px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}

.stat-label {
  margin: 0 0 6px;
  color: var(--hero-default-500);
  font-size: 13px !important;
  font-weight: 700;
}

.stat-value {
  margin: 0;
  color: var(--hero-foreground);
  font-size: 19px !important;
  font-weight: 850;
}
.desctiption {
  margin-top: 14px;
  font-size: 13px !important;
  color: var(--hero-default-500);
}
.favicon {
  margin: 0;
  border-radius: 8px;
}
.source-url {
  margin: 8px auto 0;
  font-size: 14px !important;
  color: var(--hero-default-500);
  max-width: 100%;
  overflow-wrap: anywhere;
}
</style>
