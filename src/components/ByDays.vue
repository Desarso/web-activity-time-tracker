<template>
  <div class="no-data" v-if="isLoading">
    <img height="55" src="../assets/icons/preloader.gif" />
  </div>

  <div v-else>
    <no-data-by-days v-if="countOfDays == undefined || (countOfDays == 0 && !noData)" />

    <div v-else-if="noData">
      <div class="no-data">
        {{ t('noDataForPeriod.message') }}
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
      </div>
    </div>

    <div v-else>
      <div class="date-block">
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
        <input type="button" :value="t('exportToCsv.message')" @click="exportToCsv()" />
      </div>

      <div class="stats-block block">
        <div class="header">{{ t('averageTimeByDays.message') }}</div>
        <p>{{ convertSummaryTimeToString(tabsByDays!.averageTime) }}</p>
      </div>

      <div class="ml-20 mr-20 by-days-chart">
        <ByDaysChart :data="tabsByDays!" />
      </div>

      <div>
        <Expander :day="t('allTime.message')" :time="tabsByDays?.summaryTime || 0" class="total">
          <TabItem
            v-for="(tab, i) of mergeAllDays(tabsByDays?.days)"
            :item="tab"
            :listType="TypeOfList.ByDays"
            :summaryTimeForWholeDay="tabsByDays?.summaryTime || 0"
          />
        </Expander>

        <Expander
          v-for="(tabDay, i) of tabsByDays?.days"
          :key="i"
          :day="tabDay.day"
          :time="tabDay.time"
        >
          <TabItem
            v-for="(tab, i) of tabDay.tabs"
            :key="i"
            :item="tab"
            :listType="TypeOfList.ByDays"
            :summaryTimeForWholeDay="tabDay.time"
          />
        </Expander>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TabList',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TabItem from '../components/TabItem.vue';
import NoDataByDays from './NoDataByDays.vue';
import ByDaysChart from '../components/ByDaysChart.vue';
import Expander from '../components/Expander.vue';
import { TabListByDays } from '../dto/tabListSummary';
import { CurrentTabItem } from '../dto/currentTabItem';
import { useTabListByDays } from '../functions/useTabListByDays';
import { convertSummaryTimeToString } from '../utils/converter';
import { ranges, ThisWeekRange } from '../utils/date';
import { useImportToCsvWithData } from '../functions/useImportToCsv';
import { useFile, FileType } from '../functions/useFile';
import { TypeOfList } from '../utils/enums';

const { t } = useI18n();

const tabsByDays = ref<TabListByDays>();
const isLoading = ref<boolean>();
const noData = ref<boolean>();
const selectedDate = ref<Date[]>();

const presetRanges = ranges();

const countOfDays = computed(() =>
  tabsByDays.value != undefined ? tabsByDays.value.days.length : 0,
);

async function loadList(dateFrom: Date, dateTo: Date) {
  const tabList = await useTabListByDays(dateFrom, dateTo);
  if (tabList != null) {
    tabsByDays.value = tabList;
    if (tabList.days.length == 0 && tabList.summaryTime == 0) noData.value = true;
    else noData.value = false;
  }
  isLoading.value = false;
}

async function handleDate(modelData: Date[]) {
  selectedDate.value = modelData;
  const dateFrom = selectedDate.value?.[0] as Date;
  const dateTo = selectedDate.value?.[1] as Date;
  await loadList(dateFrom, dateTo);
}

onMounted(async () => {
  isLoading.value = true;
  selectedDate.value = ThisWeekRange;
  const dateFrom = selectedDate.value?.[0] as Date;
  const dateTo = selectedDate.value?.[1] as Date;
  await loadList(dateFrom, dateTo);
});

async function exportToCsv() {
  const dateFrom = selectedDate.value?.[0] as Date;
  const dateTo = selectedDate.value?.[1] as Date;
  const csv = await useImportToCsvWithData(tabsByDays.value?.days);
  useFile(
    csv,
    FileType.CSV,
    `websites_${dateFrom.toLocaleDateString()}-${dateTo.toLocaleDateString()}.csv`,
  );
}

function mergeAllDays(days: TabListByDays['days'] | undefined): CurrentTabItem[] {
  if (!days) return [];

  const urlMap = new Map<string, CurrentTabItem>();

  for (const day of days) {
    for (const tab of day.tabs) {
      if (!urlMap.has(tab.url)) {
        urlMap.set(tab.url, { ...tab });
        continue;
      }

      const existingTab = urlMap.get(tab.url)!;
      existingTab.summaryTime += tab.summaryTime;
      existingTab.sessions += tab.sessions;
    }
  }

  return Array.from(urlMap.values()).sort((a, b) => b.summaryTime - a.summaryTime);
}
</script>

<style scoped>
.stats-block.block {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 12px 25px;
  padding: 18px;
  text-align: center;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}

.stats-block.block .header {
  background-color: transparent;
  color: var(--hero-default-500);
  padding: 0;
  font-size: 13px;
  font-weight: 850;
}

.stats-block.block p {
  margin: 8px 0 0;
  text-align: center;
  font-weight: 850;
  font-size: 22px;
  color: var(--hero-foreground);
}
.date-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin: 0 25px;
  padding: 14px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.by-days-chart {
  height: 240px;
  padding: 16px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.expander.total {
  background-color: var(--hero-primary-soft);
}
</style>
