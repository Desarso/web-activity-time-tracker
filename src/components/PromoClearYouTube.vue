<template>
  <div class="review-block" v-if="showReview && canShowPromo">
    <div class="img-block">
      <img src="../assets/icons/clear-youtube-logo.svg" height="45" />
    </div>
    <p>{{ t('promoClearYoutube.message') }}</p>
    <input type="button" :value="t('promoClearYoutube.description')" @click="openStore()" />
    <button class="close-action" type="button" @click="closeBlock()">
      <TablerIcon name="x" :size="18" />
    </button>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PromoClearYouTube',
};
</script>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import { CHROME_STORE_CLEAR_YOUTUBE_URL } from '../utils/chrome-url';
import { usePromoExtension } from '../compositions/usePromoExtension';
import { computedAsync } from '@vueuse/core';
import { useExtensionPage } from '../compositions/useExtensionPage';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const settingsStorage = injectStorage();
const extensionPage = useExtensionPage();

const showReview = ref<boolean>(true);

const canShowPromo = computedAsync(async () => await usePromoExtension());

async function closeBlock() {
  showReview.value = false;
  await saveValue();
}

async function openStore() {
  showReview.value = false;
  window.open(CHROME_STORE_CLEAR_YOUTUBE_URL, '_blank');
  await saveValue();
}

async function saveValue() {
  let param: StorageParams | undefined = undefined;
  if (extensionPage.isBlockPage.value) param = StorageParams.PROMO_CLEAR_YOUTUBE_ON_BLOCK;
  if (extensionPage.isLimitPage.value) param = StorageParams.PROMO_CLEAR_YOUTUBE_ON_LIMITS;
  if (param) await settingsStorage.saveValue(param, true);
}
</script>

<style scoped>
.review-block {
  margin: 20px 0 20px 0;
  padding: 14px;
  font-size: 14px;
  background:
    linear-gradient(135deg, rgba(0, 111, 238, 0.1), rgba(23, 201, 100, 0.08)),
    var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.review-block .btn-block {
  margin: 8px 5px 0 0;
  vertical-align: top;
  float: right;
}
.review-block p {
  display: inline-block;
  margin: 0 10px;
  color: var(--hero-foreground);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  width: 70%;
}
.review-block img {
  margin-left: 8px;
  float: right;
}

.review-block .close-action {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--hero-default-500);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  cursor: pointer;
}
</style>
