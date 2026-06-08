<template>
  <div class="stats-block">
    <div class="row">
      <div class="block">
        <div class="header">{{ t('firstActiveDay.message') }}</div>
        <p>{{ data.firstDay.toLocaleDateString() }}</p>
      </div>
      <div class="block">
        <div class="header">{{ t('numberOfActiveDays.message') }}</div>
        <p>{{ data.activeDaysTotal }}</p>
      </div>
      <div class="block">
        <div class="header">{{ t('totalNumberOfDays.message') }}</div>
        <p>{{ data.daysTotal }}</p>
      </div>
    </div>
    <div class="row">
      <div class="block">
        <div class="header">{{ t('todayTime.message') }}</div>
        <p>{{ convertSummaryTimeToString(data.todaySummaryTime) }}</p>
      </div>
      <div class="block">
        <div class="header">{{ t('allTime.message') }}</div>
        <p>{{ convertSummaryTimeToString(data.summaryTime) }}</p>
      </div>
      <div class="block">
        <div class="header">{{ t('averageTime.message') }}</div>
        <p>{{ convertSummaryTimeToString(data.averageTimeByActiveDays) }}</p>
      </div>
    </div>
    <div class="row">
      <div class="block">
        <div class="header">
          {{ t('mostActiveDay.message') }}
          <div class="tooltip">
            <button
              type="button"
              :class="['most-day', { muted: !isIncludedCurrentForActiveDays }]"
              @click="excludeTodayFromMostActive()"
            >
              <TablerIcon name="calendar" :size="16" :stroke="2.4" />
            </button>
            <span class="tooltiptext">{{
              isIncludedCurrentForActiveDays ? t('todayInclude.message') : t('todayEcclude.message')
            }}</span>
          </div>
        </div>
        <p>{{ mostActiveDay }}</p>
        <p>{{ mostActiveDayTime }}</p>
      </div>
      <div class="block">
        <div class="header">
          {{ t('mostInactiveDay.message') }}
          <div class="tooltip">
            <button
              type="button"
              :class="['most-day', { muted: !isIncludedCurrentForInActiveDays }]"
              @click="excludeTodayFromMostInActive()"
            >
              <TablerIcon name="calendar" :size="16" :stroke="2.4" />
            </button>
            <span class="tooltiptext">
              {{
                isIncludedCurrentForInActiveDays
                  ? t('todayInclude.message')
                  : t('todayEcclude.message')
              }}
            </span>
          </div>
        </div>
        <p>{{ mostInActiveDay }}</p>
        <p>
          {{ mostInActiveDayTime }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'OverallStatistics',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { OverallStats } from '../dto/tabListSummary';
import { convertSummaryTimeToString } from '../utils/converter';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const props = defineProps<{
  data: OverallStats;
}>();

onMounted(() => {
  isIncludedCurrentForActiveDays.value = true;
  isIncludedCurrentForInActiveDays.value = true;
});

const isIncludedCurrentForActiveDays = ref<boolean>();
const isIncludedCurrentForInActiveDays = ref<boolean>();

const mostActiveDay = computed(() =>
  isIncludedCurrentForActiveDays.value
    ? props.data.mostActiveDay.date.toLocaleDateString()
    : props.data.mostActiveDayExceptToday?.date.toLocaleDateString(),
);

const mostActiveDayTime = computed(() =>
  isIncludedCurrentForActiveDays.value
    ? convertSummaryTimeToString(props.data.mostActiveDay.summaryTime)
    : props.data.mostActiveDayExceptToday != null
    ? convertSummaryTimeToString(props.data.mostActiveDayExceptToday.summaryTime)
    : '-',
);

const mostInActiveDay = computed(() =>
  isIncludedCurrentForInActiveDays.value
    ? props.data.mostInactiveDay.date.toLocaleDateString()
    : props.data.mostInactiveDayExceptToday?.date.toLocaleDateString(),
);

const mostInActiveDayTime = computed(() =>
  isIncludedCurrentForInActiveDays.value
    ? convertSummaryTimeToString(props.data.mostInactiveDay.summaryTime)
    : props.data.mostInactiveDayExceptToday != null
    ? convertSummaryTimeToString(props.data.mostInactiveDayExceptToday.summaryTime)
    : '-',
);

function excludeTodayFromMostActive() {
  isIncludedCurrentForActiveDays.value = !isIncludedCurrentForActiveDays.value;
}

function excludeTodayFromMostInActive() {
  isIncludedCurrentForInActiveDays.value = !isIncludedCurrentForInActiveDays.value;
}
</script>

<style scoped>
.stats-block {
  margin: 8px 16px 16px;
  padding: 12px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}

.stats-block .row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 0;
}

.stats-block .block {
  width: 100%;
  min-height: 76px;
  text-align: center;
  padding: 10px;
  background: var(--hero-default-100);
  border-radius: var(--hero-radius-md);
}

.stats-block .block .header {
  background-color: transparent;
  color: var(--hero-default-500);
  padding: 0;
  border-radius: 0;
  font-size: 12px;
  font-weight: 800;
}

.stats-block .block p {
  margin: 5px 0 0;
  text-align: center;
  font-weight: 850;
  font-size: 14px;
  color: var(--hero-foreground);
}
.most-day {
  cursor: pointer;
  margin-left: 5px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--hero-primary-200);
  border-radius: var(--hero-radius-md);
  background: var(--hero-primary-50);
  color: var(--hero-primary);
  vertical-align: middle;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.most-day:hover {
  background: var(--hero-primary-100);
  transform: translateY(-1px);
}

.most-day.muted {
  border-color: var(--hero-default-200);
  background: var(--hero-default-100);
  color: var(--hero-default-400);
}
</style>
