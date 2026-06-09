<template>
  <div class="limits-time-block mb-20">
    <HeroInput
      :disabled="isEdit"
      :placeholder="t('enterWebsite.message')"
      v-model="newWebsiteForList"
    />
    <VueDatePicker v-model="time" time-picker class="date-picker height" />
    <HeroButton
      variant="primary"
      :disabled="isDisabledSaving"
      @click="isEdit ? editItem() : addToList()"
    >
      {{ !isEdit ? t('addWebsite.message') : t('save.message') }}
    </HeroButton>
  </div>
  <div class="mt-10" v-if="showCompletelyBlockValue">
    <HeroCheckbox
      :model-value="isCheckedCompletelyBlocked"
      :label="t('completelyBlocked.description')"
      @change="completelyBlock"
    />
  </div>
  <ul readonly class="url-list">
    <li v-for="(limit, i) of list" :key="i">
      <div>
        <button class="icon-action danger" type="button" @click="deleteFromList(limit.domain)">
          <TablerIcon name="trash" :size="18" />
        </button>
        <button class="icon-action" type="button" @click="editItemFromList(limit.domain, limit.time)">
          <TablerIcon name="edit" :size="18" />
        </button>
        <Favicon :type="TypeOfUrl.WebSite" :favicon="getFavicon(limit.domain)" />
        <span>{{ limit.domain }}</span>
        <div>
          <p class="time-value d-inline-block" v-if="!completelyBlocked(limit.time)">
            {{ t('limit.message') }} : {{ getTime(limit.time) }}
          </p>
          <p class="blocked" v-if="completelyBlocked(limit.time)">
            {{ t('completelyBlocked.message') }}
          </p>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
export default {
  name: 'ListWithTime',
};
</script>

<script lang="ts" setup>
import Favicon from './Favicon.vue';
import { getFavicon } from '../utils/favicon';
import { useNotification } from '@kyvg/vue3-notification';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { Time } from '../utils/time';
import { computed, onMounted, ref } from 'vue';
import { ListWithTime, TypeOfUrl } from '../utils/enums';
import { StorageParams } from '../storage/storage-params';
import { isDomainEquals } from '../utils/common';
import { extractHostname } from '../utils/extract-hostname';
import { convertHHMMToSeconds, convertSecondsToHHMM } from '../utils/converter';
import { Restriction } from '../entity/restriction';
import { BaseTimeList } from '../entity/baseTimeList';
import { Notifications } from '../entity/notification';
import HeroButton from './HeroButton.vue';
import HeroCheckbox from './HeroCheckbox.vue';
import HeroInput from './HeroInput.vue';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const props = defineProps<{
  type: ListWithTime;
}>();

const notification = useNotification();
const settingsStorage = injectStorage();

const list = ref<BaseTimeList[]>();
const isEdit = ref<boolean>();
const time = ref<Time>({
  hours: 0,
  minutes: 30,
});
const newWebsiteForList = ref<string>();
const storageParam = ref<StorageParams>();
const isCheckedCompletelyBlocked = computed(
  () => time.value != undefined && time.value.hours == 0 && time.value.minutes == 0,
);
const showCompletelyBlockValue = computed(
  () =>
    props.type == ListWithTime.Limits &&
    newWebsiteForList.value != undefined &&
    newWebsiteForList.value != '',
);

onMounted(async () => {
  switch (props.type) {
    case ListWithTime.Limits:
      list.value = Object.values(
        await settingsStorage.getValue(StorageParams.RESTRICTION_LIST, []),
      ) as Restriction[];
      storageParam.value = StorageParams.RESTRICTION_LIST;
      break;
    case ListWithTime.Notifications:
      list.value = Object.values(
        await settingsStorage.getValue(StorageParams.NOTIFICATION_LIST, []),
      ) as Notifications[];
      storageParam.value = StorageParams.NOTIFICATION_LIST;
      break;
  }
});

function addToList() {
  const existingItem = list.value?.find(x =>
    isDomainEquals(extractHostname(x.domain), extractHostname(newWebsiteForList.value!)),
  );
  if (existingItem !== undefined) {
    notification.notify({
      title: 'You have already added this site',
      type: 'error',
    });
  } else {
    const newLimit = new Restriction(
      extractHostname(newWebsiteForList.value!),
      time.value.hours,
      time.value.minutes,
    );
    list.value?.push(newLimit);
    save(list.value);
    newWebsiteForList.value = '';
  }
}

function completelyBlock() {
  time.value.hours = 0;
  time.value.minutes = 0;
}

function completelyBlocked(time: number) {
  return props.type == ListWithTime.Limits && time == 0;
}

function getTime(time: number) {
  const timeObj = convertSecondsToHHMM(time);
  return `${timeObj.hours}:${timeObj.minutes < 10 ? '0' + timeObj.minutes : timeObj.minutes}`;
}

const isDisabledSaving = computed(() => {
  if (
    props.type == ListWithTime.Notifications &&
    time.value?.hours == 0 &&
    time.value?.minutes == 0
  )
    return true;
  return (
    newWebsiteForList.value == '' || newWebsiteForList.value == undefined || time.value == null
  );
});

function deleteFromList(url: string) {
  list.value = list.value!.filter(x => x.domain != url);
  save(list.value);
  newWebsiteForList.value = '';
  isEdit.value = false;
}

function editItemFromList(url: string, timeForUrl: number) {
  isEdit.value = true;
  newWebsiteForList.value = url;
  const timeObj = convertSecondsToHHMM(timeForUrl);
  time.value.hours = timeObj.hours;
  time.value.minutes = timeObj.minutes;
}

function editItem() {
  const existingItem = list.value?.find(x =>
    isDomainEquals(extractHostname(x.domain), extractHostname(newWebsiteForList.value!)),
  );
  if (existingItem != undefined) {
    existingItem.time = convertHHMMToSeconds(time.value.hours, time.value.minutes);
    save(list.value);
    newWebsiteForList.value = '';
    isEdit.value = false;
  }
}

async function save(value: any) {
  if (value != undefined) await settingsStorage.saveValue(storageParam.value!, value);
}
</script>

<style scoped>
.limits-time-block {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 120px auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
}

.limits-time-block .date-picker {
  width: 120px;
  margin: 0;
}
.blocked {
  display: inline-block;
  font-size: 13px;
  color: var(--hero-danger);
  margin-left: 55px;
  margin-top: 0;
  font-weight: 700;
}

.icon-action {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  color: var(--hero-default-500);
  background: var(--hero-content1);
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
