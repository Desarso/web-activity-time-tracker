<template>
  <div class="review-block" v-if="showReview">
    <p>{{ t('enjoyAndReview.message') }}</p>
    <button class="close-action" type="button" @click="closeBlock()">
      <TablerIcon name="x" :size="18" />
    </button>
    <HeroButton class="review-action" variant="primary" @click="openStore()">
      {{ t('enjoyAndReview.description') }}
    </HeroButton>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Review',
};
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import { addDays, startOfToday } from 'date-fns';
import { addHours } from 'date-fns/esm';
import { CHROME_STORE_REVIEW_URL, EDGE_STORE_REVIEW_URL } from '../utils/chrome-url';
import HeroButton from './HeroButton.vue';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const settingsStorage = injectStorage();
const PROMPT_AT_TIME_OF_DAY = 12;
const ADD_DAYS_FIRST = 2;
const ADD_DAYS_NEXT = 5;

const showReview = ref<boolean>();

onMounted(async () => {
  showReview.value = false;
  const reviewDate = await settingsStorage.getValue(StorageParams.REVIEW_DATE);

  if (reviewDate == undefined) {
    let nextTime = await settingsStorage.getValue(StorageParams.REVIEW_PROMPT_AT);
    if (nextTime == undefined) {
      await settingsStorage.saveValue(
        StorageParams.REVIEW_PROMPT_AT,
        addDays(addHours(startOfToday(), PROMPT_AT_TIME_OF_DAY), ADD_DAYS_FIRST).toString(),
      );
    } else {
      nextTime = new Date(nextTime);
      if (nextTime < new Date()) showReview.value = true;
    }
  }
});

async function closeBlock() {
  showReview.value = false;
  await settingsStorage.saveValue(
    StorageParams.REVIEW_PROMPT_AT,
    addDays(addHours(startOfToday(), PROMPT_AT_TIME_OF_DAY), ADD_DAYS_NEXT).toString(),
  );
}

async function openStore() {
  window.open(__BROWSER__ == 'edge' ? EDGE_STORE_REVIEW_URL : CHROME_STORE_REVIEW_URL, '_blank');
  await settingsStorage.saveValue(StorageParams.REVIEW_DATE, new Date().toString());
}
</script>

<style scoped>
.review-block {
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
.review-action {
  margin: 0 20px 0 0;
  float: right;
  width: auto;
}
.review-block p {
  display: inline-block;
  margin: 10px 8px;
  color: var(--hero-foreground);
  font-size: 15px;
  font-weight: 850;
}
.review-block .close-action {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  color: var(--hero-default-500);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  cursor: pointer;
  float: right;
}
</style>
