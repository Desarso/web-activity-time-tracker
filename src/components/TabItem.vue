<template>
  <div class="tab-item">
    <Favicon :favicon="item.favicon" :type="typeOfUrl" />
    <div
      class="ml-10 flex-grow-2"
      @mouseover="isShowCmdButtons = true"
      @mouseleave="isShowCmdButtons = false"
    >
      <div class="first-block">
        <div>
          <p class="url">{{ url }}</p>
          <span v-if="item.incognito" class="private-chip">
            <TablerIcon name="spy" :size="14" />
            Private
          </span>
          <BadgeIcons :url="url" :type="typeOfUrl" :listType="listType" />
          <p class="links" v-if="isShowCmdButtons && !item.incognito" title="Statistics">
            <button class="link" type="button" @click="openStats(item.url)">
              <TablerIcon name="chart-bar" :size="18" />
            </button>
          </p>

          <p class="links" v-if="isShowCmdButtons" title="Open website">
            <button class="link" type="button" @click="openUrl(item.url)">
              <TablerIcon name="external-link" :size="18" />
            </button>
          </p>
        </div>
        <p class="text-right time">{{ summaryTimeForTab }}</p>
      </div>
      <p v-if="showWarningMessage" class="warning-message">
        {{ t('cannotOpenFile.message') }}
      </p>
      <div class="second-block">
        <div class="progress-bar">
          <div :style="styleForProgressBar"></div>
        </div>
        <p class="text-right percent">{{ percent }} %</p>
      </div>
      <p class="sessions">{{ sessions }}</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TabItem',
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Favicon from './Favicon.vue';
import BadgeIcons from './BadgeIcons.vue';
import { convertSummaryTimeToString } from '../utils/converter';
import { getPercentage } from '../utils/common';
import { CurrentTabItem } from '../dto/currentTabItem';
import { SettingsTab, TypeOfList, TypeOfUrl } from '../utils/enums';
import { openPage } from '../utils/open-page';
import { getTypeOfUrl } from '../utils/get-type-of-url';
import TablerIcon from './TablerIcon.vue';

const { t } = useI18n();

const props = defineProps<{
  item: CurrentTabItem;
  summaryTimeForWholeDay: number;
  listType: TypeOfList;
}>();

const isShowCmdButtons = ref<boolean>();

const typeOfUrl = computed(() => getTypeOfUrl(props.item.url));

const url = computed(() =>
  typeOfUrl.value == TypeOfUrl.Document
    ? decodeURI(props.item.url.split('///')[1])
    : props.item.url,
);

const sessions = computed(() => {
  if (props.item.sessions == 0) return `0 ${t('someSession.message')}`;
  if (props.item.sessions > 1) return `${props.item.sessions} ${t('someSession.message')}`;
  if (props.item.sessions == 1) return `${props.item.sessions} ${t('session.message')}`;
});

const summaryTimeForTab = computed(() => convertSummaryTimeToString(props.item.summaryTime));
const percent = computed(() => getPercentage(props.item.summaryTime, props.summaryTimeForWholeDay));

const styleForProgressBar = computed(() => `width: ${percent.value}%`);

function openUrl(url: string) {
  if (typeOfUrl.value != TypeOfUrl.Document && !url.startsWith('http')) {
    url = `https://${url}`;
    window.open(url, '_blank');
  } else showWarningMessage.value = true;
}

async function openStats(url: string) {
  await openPage(SettingsTab.WebsiteStats, url);
}

const showWarningMessage = ref<boolean>();
</script>

<style scoped>
.tab-item {
  padding: 12px;
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  margin: 8px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: var(--hero-content1);
  box-shadow: var(--hero-shadow-sm);
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}
.tab-item:hover {
  border-color: rgba(0, 111, 238, 0.28);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.tab-item .links {
  display: inline-block;
  margin: 0;
  cursor: pointer;
  margin: 0 5px;
}
.tab-item .links .link {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  color: var(--hero-default-500);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: 8px;
  cursor: pointer;
}
.tab-item .url {
  color: var(--hero-foreground);
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
  overflow-wrap: anywhere;
  display: inline-block;
}
.tab-item .url:hover {
  color: var(--hero-primary);
}
.private-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 24px;
  margin-left: 8px;
  padding: 0 8px;
  border-radius: 999px;
  color: var(--hero-warning);
  background: var(--hero-warning-soft);
  border: 1px solid rgba(245, 165, 36, 0.22);
  font-size: 12px;
  font-weight: 850;
  vertical-align: middle;
}
.tab-item p {
  margin: 5px;
}
.tab-item .time {
  color: var(--hero-foreground);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}
.tab-item .progress-bar {
  width: 100%;
  margin: 5px 0 0 5px;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid var(--hero-default-200);
  background: var(--hero-default-100);
}
.tab-item .progress-bar div {
  height: 6px;
  background: linear-gradient(90deg, var(--hero-primary), #17c964);
  border-radius: 999px;
}
.flex-grow-2 {
  flex-grow: 2;
}
.tab-item .first-block {
  display: flex;
  justify-content: space-between;
}
.tab-item .second-block {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}
.tab-item .percent {
  white-space: nowrap;
  margin: 0 5px 0 20px;
  color: var(--hero-default-500);
  font-weight: 700;
}
.tab-item .sessions {
  margin: 0 0 0 5px;
  color: var(--hero-default-500);
  font-size: 12px;
  font-weight: 700;
}
.tab-item .warning-message {
  color: var(--hero-warning);
}
</style>
