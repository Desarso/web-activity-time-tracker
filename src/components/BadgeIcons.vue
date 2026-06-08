<template>
  <div class="d-inline-block">
    <span v-if="showDocumentBadge" class="badge-document">{{ t('document.message') }}</span>
    <span v-if="showLimitBadge" class="badge-block">{{ t('limit.message') }}</span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BadgeIcons',
};
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TypeOfList, TypeOfUrl } from '../utils/enums';
import { isDomainInLimits } from '../functions/limit-list';
import { computedAsync } from '@vueuse/core';

const { t } = useI18n();

const props = defineProps<{
  url: string;
  type: TypeOfUrl;
  listType: TypeOfList;
}>();

const isLimit = computedAsync(async () => {
  return await isDomainInLimits(props.url);
}, false);

const showDocumentBadge = computed(() => props.type == TypeOfUrl.Document);
const showLimitBadge = computed(
  () =>
    (props.listType == TypeOfList.Today || props.listType == TypeOfList.Dashboard) &&
    isLimit.value == true,
);
</script>

<style scoped>
span.badge-document {
  border-radius: 999px;
  background-color: var(--hero-primary-soft);
  border: 1px solid rgba(0, 111, 238, 0.22);
  padding: 3px 8px;
  font-size: 11px;
  color: var(--hero-primary);
  font-weight: 850;
}
span.badge-block {
  border-radius: 999px;
  background-color: var(--hero-danger-soft);
  border: 1px solid rgba(243, 18, 96, 0.22);
  padding: 3px 8px;
  font-size: 11px;
  color: var(--hero-danger);
  font-weight: 850;
}
</style>
