<template>
  <div>
    <p class="title mt-0">{{ t('whiteList.message') }}</p>
    <ul readonly class="url-list">
      <li v-for="(url, i) of whiteList" :key="i">
        <div>
          <button class="icon-action danger" type="button" @click="deleteFromWhiteList(url)">
            <TablerIcon name="trash" :size="18" />
          </button>
          <Favicon :type="TypeOfUrl.WebSite" :favicon="getFavicon(url)" />
          <span>{{ url }}</span>
        </div>
      </li>
    </ul>
    <div class="add-site-row mt-20">
      <HeroInput
        :placeholder="t('enterWebsite.message')"
        v-model="newWebsiteForWhiteList"
      />
      <HeroButton
        variant="primary"
        :disabled="newWebsiteForWhiteList == null || newWebsiteForWhiteList == ''"
        @click="addToWhiteList()"
      >
        {{ t('addWebsite.message') }}
      </HeroButton>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WhiteList',
};
</script>

<script lang="ts" setup>
import Favicon from './Favicon.vue';
import { getFavicon } from '../utils/favicon';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { TypeOfUrl } from '../utils/enums';
import { useNotification } from '@kyvg/vue3-notification';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams } from '../storage/storage-params';
import { isDomainEquals } from '../utils/common';
import { extractHostname } from '../utils/extract-hostname';
import HeroButton from './HeroButton.vue';
import HeroInput from './HeroInput.vue';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const notification = useNotification();

const settingsStorage = injectStorage();

const whiteList = ref<string[]>();
const newWebsiteForWhiteList = ref<string>();

onMounted(async () => {
  whiteList.value = Object.values(await settingsStorage.getValue(StorageParams.BLACK_LIST, []));
});

function addToWhiteList() {
  const existingItem = whiteList.value?.find(x =>
    isDomainEquals(extractHostname(x), extractHostname(newWebsiteForWhiteList.value!)),
  );
  if (existingItem !== undefined) {
    notification.notify({
      title: 'You have already added this site',
      type: 'error',
    });
  } else {
    const newWebsite = extractHostname(newWebsiteForWhiteList.value!);
    whiteList.value?.push(newWebsite);
    save(whiteList.value);
    newWebsiteForWhiteList.value = '';
  }
}

function deleteFromWhiteList(url: string) {
  whiteList.value = whiteList.value!.filter(x => x != url);
  save(whiteList.value);
}

async function save(value: any) {
  if (value != undefined) await settingsStorage.saveValue(StorageParams.BLACK_LIST, value);
}
</script>

<style scoped>
.about .about-label {
  font-size: 14px;
  margin-bottom: 30px;
  display: block;
}

.add-site-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
  max-width: 670px;
}

.icon-action {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: var(--hero-default-500);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  cursor: pointer;
  vertical-align: middle;
}

.icon-action.danger {
  color: var(--hero-danger);
  background: var(--hero-danger-soft);
  border-color: rgba(243, 18, 96, 0.22);
}
</style>
