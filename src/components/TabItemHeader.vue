<template>
  <div class="header-block">
    <div class="time-block">
      <p>{{ title }}</p>
      <p class="time">{{ summaryTimeString }}</p>
    </div>
    <div class="sorted-block">
      <span class="mr-5">{{ t('sortBy.message') }}</span>
      <HeroSelect
        v-model="sortingBySelected"
        :options="sortingOptions"
        :ariaLabel="t('sortBy.message')"
        @change="sortingBy()"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TabItemHeader',
};
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { convertSummaryTimeToString } from '../utils/converter';
import { ActivityScope, SortingBy, TypeOfList } from '../utils/enums';
import HeroSelect from './HeroSelect.vue';

const { t } = useI18n();

const props = defineProps<{
  listType: TypeOfList;
  scope?: ActivityScope;
  summaryTime: number;
  countOfSites: number;
  firstDay?: Date;
  countOfActiveDays: number;
}>();

const sortingBySelected = ref<SortingBy>();

const emit = defineEmits<{
  (event: 'sortingBy', sortingBy: SortingBy): void;
}>();

const title = computed(() => {
  if (props.scope == ActivityScope.Incognito) return 'Private activity';
  if (props.listType == TypeOfList.Today || props.listType == TypeOfList.Dashboard)
    return t('today.message');
  if (props.listType == TypeOfList.All) {
    let countOfActiveDays =
      props.countOfActiveDays > 1 ? `(${props.countOfActiveDays} ${t('days.message')})` : '';
    return `${t(
      'aggregate.message',
    )} ${props.firstDay?.toLocaleDateString() ?? ''} ${countOfActiveDays} (${props.countOfSites} ${t(
      'websites.message',
    )})`;
  }
});

onMounted(async () => {
  sortingBySelected.value = SortingBy.UsageTime;
});

const summaryTimeString = computed(() => convertSummaryTimeToString(props.summaryTime));
const sortingOptions = computed(() => [
  { label: t('usageTime.message'), value: SortingBy.UsageTime },
  { label: t('sessions.message'), value: SortingBy.Sessions },
]);

function sortingBy() {
  emit('sortingBy', sortingBySelected.value!);
}
</script>

<style scoped>
.header-block {
  margin: 12px 16px;
  padding: 14px;
  text-align: left;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  background-color: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.time-block {
  flex: auto;
}
p {
  font-size: 14px;
  margin: 0;
  color: var(--hero-default-500);
  font-weight: 700;
}
.time {
  margin-top: 3px;
  color: var(--hero-foreground);
  font-size: 22px;
  font-weight: 850;
}
.sorted-block {
  margin: auto;
  margin-right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--hero-default-500);
  font-weight: 700;
}
</style>
