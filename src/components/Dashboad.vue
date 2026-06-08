<template>
  <div class="settings-item">
    <label class="title"> {{ t('dashboard.message') }} </label>
  </div>
  <div class="scope-switch">
    <button
      :class="['scope-btn', activityScope == ActivityScope.Normal ? 'active' : '']"
      @click="openScope(ActivityScope.Normal)"
    >
      <TablerIcon name="layout-dashboard" :size="18" />
      Normal
    </button>
    <button
      :class="['scope-btn', activityScope == ActivityScope.Incognito ? 'active private' : '']"
      @click="openScope(ActivityScope.Incognito)"
    >
      <TablerIcon name="spy" :size="18" />
      Private
    </button>
  </div>
  <div v-if="activityScope == ActivityScope.Incognito" class="private-note">
    <TablerIcon name="spy" :size="20" />
    Private activity is tracked separately and only shown on this dashboard.
  </div>
  <div v-if="activityScope == ActivityScope.Normal" class="chart chartByHours">
    <div class="mt-10 mb-20">
      <button
        :class="['chart-btn', chart == TypeOfChart.Horly ? 'active' : '']"
        @click="openChart(TypeOfChart.Horly)"
      >
        <TablerIcon name="clock" :size="20" />
        {{ t('byHours.message') }}
      </button>
      <button
        :class="['ml-10', 'chart-btn', chart == TypeOfChart.Interval ? 'active' : '']"
        @click="openChart(TypeOfChart.Interval)"
      >
        <TablerIcon name="chart-bar" :size="20" />
        {{ t('intervals.message') }}
      </button>
    </div>
    <HourlyChart v-if="chart == TypeOfChart.Horly" />
    <TimeIntervalChart v-if="chart == TypeOfChart.Interval" />
  </div>
  <div class="tab-items">
    <TabList
      v-if="activityScope == ActivityScope.Normal && chart == TypeOfChart.Horly"
      :type="TypeOfList.Dashboard"
      :showAllStats="false"
      :scope="ActivityScope.Normal"
    />
    <TabList
      v-if="activityScope == ActivityScope.Incognito"
      :type="TypeOfList.All"
      :showAllStats="true"
      :scope="ActivityScope.Incognito"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'Dashboard',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import TimeIntervalChart from './TimeIntervalChart.vue';
import HourlyChart from './HourlyChart.vue';
import TabList from '../components/TabList.vue';
import { ActivityScope, TypeOfList } from '../utils/enums';
import { onMounted, ref } from 'vue';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();
const chart = ref<TypeOfChart>();
const activityScope = ref<ActivityScope>(ActivityScope.Normal);

enum TypeOfChart {
  Horly,
  Interval,
}

onMounted(() => {
  chart.value = TypeOfChart.Horly;
});

function openChart(type: TypeOfChart) {
  chart.value = type;
}

function openScope(scope: ActivityScope) {
  activityScope.value = scope;
}
</script>

<style scoped>
.chart {
  margin: 20px 0;
  width: min(960px, 100%);
  padding: 20px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.tab-items {
  width: min(960px, 100%);
  margin-top: 28px;
}
.scope-switch {
  display: inline-flex;
  gap: 8px;
  padding: 5px;
  margin: 14px 0 0;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
}
.scope-btn {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--hero-radius-md);
  padding: 0 14px;
  background: transparent;
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
}
.scope-btn.active {
  background: var(--hero-content1);
  color: var(--hero-primary);
  box-shadow: var(--hero-shadow-sm);
}
.scope-btn.private.active {
  color: var(--hero-warning);
}
.private-note {
  width: min(960px, 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 0;
  padding: 14px 16px;
  color: var(--hero-warning);
  background: var(--hero-warning-soft);
  border: 1px solid rgba(245, 165, 36, 0.22);
  border-radius: var(--hero-radius-lg);
  font-size: 14px;
  font-weight: 750;
}
.chartByHours {
  height: 430px;
  min-height: 0;
  overflow: hidden;
}
.chart-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--hero-default-100);
  color: var(--hero-default-500);
  border-radius: var(--hero-radius-md);
  min-height: 40px;
  line-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--hero-default-200);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  min-width: 80px;
  text-align: center;
  width: 200px;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;
}

.chart-btn.active {
  background-color: var(--hero-primary-soft) !important;
  color: var(--hero-primary);
  border-color: rgba(0, 111, 238, 0.28);
}
</style>
