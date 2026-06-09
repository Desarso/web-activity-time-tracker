<template>
  <div class="settings-item">
    <HeroCheckbox
      v-model="viewTimeInBadge"
      :label="t('viewTimeInBadge.message')"
      :description="t('viewTimeInBadge.description')"
      @change="save(StorageParams.VIEW_TIME_IN_BADGE, $event)"
    />
  </div>
  <div class="settings-item">
    <HeroCheckbox
      v-model="allowDeferringBlock"
      :label="t('allowDeferringBlock.message')"
      :description="t('allowDeferringBlock.description')"
      @change="save(StorageParams.BLOCK_DEFERRAL, $event)"
    />
  </div>
  <div class="settings-item">
    <HeroCheckbox
      v-model="darkMode"
      :label="t('darkTheme.message')"
      @change="saveDarkMode($event)"
    />
  </div>
  <div class="settings-item">
    <label class="setting-header d-inline-block">{{ t('intervalInactivity.message') }}</label>
    <HeroSelect
      class="inactivity-select"
      v-model="intervalInactivity"
      :options="inactivityOptions"
      :aria-label="t('intervalInactivity.message')"
      @change="save(StorageParams.INTERVAL_INACTIVITY, Number($event))"
    />
    <p class="description">{{ t('intervalInactivity.description') }}</p>
  </div>
  <div class="settings-item">
    <label class="setting-header d-inline-block">{{ t('exportToCsvSetting.message') }}</label>
    <p class="description">{{ t('exportToCsvSetting.description') }}</p>
    <div class="export-block">
      <VueDatePicker
        range
        :enable-time-picker="false"
        class="date-picker"
        v-model="selectedDate"
        :preset-ranges="presetRanges"
        @update:model-value="handleDate"
      >
        <template #yearly="{ label, range, presetDateRange }">
          <span @click="presetDateRange(range)">{{ label }}</span>
        </template>
      </VueDatePicker>
      <HeroButton variant="primary" @click="exportToCsv()">{{ t('exportToCsv.message') }}</HeroButton>
    </div>
  </div>
  <div class="settings-item">
    <label class="setting-header d-inline-block">{{ t('removeAllData.message') }}</label>
    <p class="description">{{ t('removeAllData.description') }}</p>
    <HeroButton variant="danger" @click="removeAll()">{{ t('remove.message') }}</HeroButton>
  </div>
  <div class="settings-item">
    <label class="setting-header d-inline-block">{{ t('backupAndRestore.message') }}</label>
    <p class="description">{{ t('backupAndRestore.description') }}</p>
    <div class="button-row">
      <HeroButton variant="secondary" @click="backup()">{{ t('backup.message') }}</HeroButton>
      <HeroButton variant="secondary" @click="restore()">{{ t('restore.message') }}</HeroButton>
    </div>
    <input
      type="file"
      ref="restoreFile"
      style="display: none"
      @change="restoreFileUpload()"
      accept="application/json"
    />
  </div>
  <div class="settings-item">
    <HeroCheckbox
      v-model="showChangelog"
      :label="t('showChangelog.message')"
      :description="t('showChangelog.description')"
      @change="save(StorageParams.SHOW_CHANGELOG, $event)"
    />
  </div>
  <div id="removeAllConfirmModal" class="modal" v-if="needToConfirmDeleteAllData">
    <div class="modal-content">
      <p class="text-center">{{ t('removeAllDataConfirm.message') }}</p>
      <div class="text-center">
        <HeroButton variant="danger" @click="removeAllConfirm()">{{ t('remove.message') }}</HeroButton>
        <HeroButton variant="secondary" @click="cancel()">{{ t('cancel.message') }}</HeroButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GeneralSettings',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { useNotification } from '@kyvg/vue3-notification';
import {
  BLOCK_DEFERRAL_DEFAULT,
  DARK_MODE_DEFAULT,
  INTERVAL_INACTIVITY_DEFAULT,
  StorageParams,
  VIEW_TIME_IN_BADGE_DEFAULT,
  InactivityInterval,
  SHOW_CHANGELOG_DEFAULT,
} from '../storage/storage-params';
import { ranges, ThisWeekRange, todayLocalDate } from '../utils/date';
import { useImportToCsv } from '../functions/useImportToCsv';
import { FileType, useFile } from '../functions/useFile';
import { useRemoveAllData } from '../functions/useRemoveAllData';
import { injectTabsRepository } from '../repository/inject-tabs-repository';
import { useRestoreData } from '../functions/useRestoreData';
import { applyDarkMode } from '../utils/dark-mode';
import HeroButton from './HeroButton.vue';
import HeroCheckbox from './HeroCheckbox.vue';
import HeroSelect from './HeroSelect.vue';

const { t } = useI18n();

const settingsStorage = injectStorage();
const notification = useNotification();

const viewTimeInBadge = ref<boolean>();
const intervalInactivity = ref<InactivityInterval>();
const allowDeferringBlock = ref<boolean>();
const darkMode = ref<boolean>();
const selectedDate = ref<Date[]>();

const presetRanges = ranges();

const needToConfirmDeleteAllData = ref<boolean>();
const showChangelog = ref<boolean>();

const restoreFile = ref<any>();
const inactivityOptions = computed(() => [
  { value: InactivityInterval.Seconds_30, label: `30 ${t('sec.message')}` },
  { value: InactivityInterval.Seconds_45, label: `45 ${t('sec.message')}` },
  { value: InactivityInterval.Min_1, label: `1 ${t('min.message')}` },
  { value: InactivityInterval.Min_2, label: `2 ${t('2min.message')}` },
  { value: InactivityInterval.Min_5, label: `5 ${t('mins.message')}` },
  { value: InactivityInterval.Min_10, label: `10 ${t('mins.message')}` },
  { value: InactivityInterval.Min_20, label: `20 ${t('mins.message')}` },
  { value: InactivityInterval.Min_30, label: `30 ${t('mins.message')}` },
]);

onMounted(async () => {
  viewTimeInBadge.value = await settingsStorage.getValue(
    StorageParams.VIEW_TIME_IN_BADGE,
    VIEW_TIME_IN_BADGE_DEFAULT,
  );
  intervalInactivity.value = await settingsStorage.getValue(
    StorageParams.INTERVAL_INACTIVITY,
    INTERVAL_INACTIVITY_DEFAULT,
  );
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  allowDeferringBlock.value = await settingsStorage.getValue(
    StorageParams.BLOCK_DEFERRAL,
    BLOCK_DEFERRAL_DEFAULT,
  );
  selectedDate.value = ThisWeekRange;
  showChangelog.value = await settingsStorage.getValue(
    StorageParams.SHOW_CHANGELOG,
    SHOW_CHANGELOG_DEFAULT,
  );
});

async function save(storageParam: StorageParams, value: any) {
  if (value != undefined) await settingsStorage.saveValue(storageParam, value);
}

async function saveDarkMode(value: boolean) {
  await save(StorageParams.DARK_MODE, value);
  applyDarkMode(value);
}

async function handleDate(modelData: Date[]) {
  selectedDate.value = modelData;
}

async function exportToCsv() {
  const dateFrom = selectedDate.value?.[0] as Date;
  const dateTo = selectedDate.value?.[1] as Date;
  if (dateFrom == undefined || dateTo == undefined) {
    notification.notify({
      title: 'No time period selected',
      type: 'warn',
    });
  } else {
    const csv = await useImportToCsv(dateFrom, dateTo);
    useFile(
      csv,
      FileType.CSV,
      `websites_${dateFrom.toLocaleDateString()}-${dateTo.toLocaleDateString()}.csv`,
    );
  }
}

async function removeAll() {
  needToConfirmDeleteAllData.value = true;
}

async function removeAllConfirm() {
  await useRemoveAllData();
  needToConfirmDeleteAllData.value = false;
}

function cancel() {
  needToConfirmDeleteAllData.value = false;
}

async function backup() {
  const repo = await injectTabsRepository();
  const tabs = repo.getTabs();
  const json = JSON.stringify(tabs);
  useFile(json, FileType.JSON, `backup-${todayLocalDate()}.json`);
}

function restore() {
  restoreFile.value.click();
}

function restoreFileUpload() {
  try {
    const file = restoreFile.value.files[0];
    if (file != null && file.type === FileType.JSON) {
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = async readerEvent => {
        if (readerEvent != null) {
          let content = readerEvent.target?.result;
          if (content != null) {
            await useRestoreData(content as string);
          }
        }
      };
    } else {
      notification.notify({
        title: 'Wrong restore file format',
        type: 'warn',
      });
    }
  } catch {
    notification.notify({
      title: 'Wrong restore file format',
      type: 'warn',
    });
  }
}
</script>

<style scoped>
.export-block {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
}

.inactivity-select {
  display: block;
  width: 220px;
  margin-top: 12px;
}

.button-row,
.text-center {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.export-block .date-picker {
  width: 250px;
  margin-right: 0;
}
</style>
