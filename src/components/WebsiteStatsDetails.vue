<template>
  <div class="container">
    <div class="block">
      <p class="title">{{ t('allTime.message') }}</p>
      <p class="value">
        {{ convertSummaryTimeToString(details.summaryTime) }}
      </p>
    </div>
    <div class="block">
      <p class="title">{{ t('sessions.message') }}</p>
      <p class="value">
        {{ details.sessions }}
      </p>
    </div>
    <div class="block">
      <p class="title">{{ t('averageDailyUsage.message') }}</p>
      <p class="value">
        {{ convertSummaryTimeToString(details.averageTime) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WebsiteStatsDetails',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { TabListByDays } from '../dto/tabListSummary';
import { convertSummaryTimeToString } from '../utils/converter';

defineProps<{
  details: TabListByDays;
}>();

const { t } = useI18n();
</script>

<style scoped>
.title {
  font-weight: 850;
  font-size: 16px;
}
.container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  width: auto;
  margin: 16px 0;
}
.block {
  padding: 18px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.block p.title {
  margin: 0;
  font-size: 13px;
  color: var(--hero-default-500);
}
.block p.value {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 850;
  color: var(--hero-foreground);
}
</style>
