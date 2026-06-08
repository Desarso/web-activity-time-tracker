<template>
  <div class="popup-shell">
    <div class="headerBlock">
      <div class="brand">
        <span class="brand-icon"><TablerIcon name="stopwatch" :size="28" :stroke="2.2" /></span>
        <div>
          <p class="eyebrow">{{ t('dashboard.message') }}</p>
          <p class="header">Web Activity Time Tracker</p>
        </div>
      </div>
      <div class="icons-block">
        <div>
          <button
            class="icon-button"
            :title="darkMode == true ? 'Disable Dark Mode' : 'Enable Dark Mode'"
            @click="changeDarkMode(!darkMode)"
          >
            <TablerIcon :name="darkMode == true ? 'sun' : 'moon'" :size="20" />
          </button>

          <button
            class="icon-button"
            :title="t('pomodoroMode.message')"
            @click="openPage(SettingsTab.Pomodoro)"
          >
            <TablerIcon name="clock-play" :size="20" />
          </button>
          <button
            class="icon-button"
            :title="t('dashboard.message')"
            @click="openPage(SettingsTab.Dashboard)"
          >
            <TablerIcon name="layout-dashboard" :size="20" />
          </button>
          <button class="icon-button" title="Sync & devices" @click="openPage(SettingsTab.Sync)">
            <TablerIcon name="devices" :size="20" />
          </button>
          <button
            class="icon-button"
            :title="t('settings.message')"
            @click="openPage(SettingsTab.GeneralSettings)"
          >
            <TablerIcon name="settings" :size="20" />
          </button>
        </div>
      </div>
    </div>
    <div class="sync-strip">
      <SyncAccountActions compact />
    </div>
    <div class="tabs">
    <input
      type="radio"
      id="todayTab"
      name="tab-control"
      checked
      v-on:change="selectTab(TypeOfList.Today)"
    />
    <input
      type="radio"
      id="allTimeTab"
      name="tab-control"
      v-on:change="selectTab(TypeOfList.All)"
    />
    <input
      type="radio"
      id="byDaysTab"
      name="tab-control"
      v-on:change="selectTab(TypeOfList.ByDays)"
    />
    <ul>
      <li title="Today">
        <label for="todayTab" role="button"
          ><span>{{ t('today.message') }}</span></label
        >
      </li>
      <li title="All The Time">
        <label for="allTimeTab" role="button"
          ><span>{{ t('allTime.message') }}</span></label
        >
      </li>
      <li title="By Days">
        <label for="byDaysTab" role="button"
          ><span>{{ t('byDays.message') }}</span></label
        >
      </li>
    </ul>

    <div class="slider"><div class="indicator"></div></div>
    <div class="content">
      <section id="todayTabList">
        <TabList
          v-if="activeTab == TypeOfList.Today"
          :type="TypeOfList.Today"
          :showAllStats="false"
        />
      </section>
      <section id="summary">
        <TabList v-if="activeTab == TypeOfList.All" :type="TypeOfList.All" :showAllStats="true" />
      </section>
      <section id="byDaysTabList">
        <ByDays v-if="activeTab == TypeOfList.ByDays" />
      </section>
    </div>
  </div>
  <PomodoroInfo />
  <Review />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TabList from '../components/TabList.vue';
import ByDays from '../components/ByDays.vue';
import Review from '../components/Review.vue';
import PomodoroInfo from '../components/PomodoroInfo.vue';
import SyncAccountActions from '../components/SyncAccountActions.vue';
import { openPage } from '../utils/open-page';
import { SettingsTab, TypeOfList } from '../utils/enums';
import { injectStorage } from '../storage/inject-storage';
import { DARK_MODE_DEFAULT, StorageParams } from '../storage/storage-params';
import { applyDarkMode } from '../utils/dark-mode';
import TablerIcon from '../components/TablerIcon.vue';

const { t } = useI18n();
const settingsStorage = injectStorage();

const activeTab = ref<TypeOfList>();
const darkMode = ref<boolean>();

onMounted(async () => {
  activeTab.value = TypeOfList.Today;
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  if (darkMode.value) applyDarkMode(darkMode.value);
});

function selectTab(type: TypeOfList) {
  activeTab.value = type;
}

async function changeDarkMode(value: boolean) {
  await settingsStorage.saveValue(StorageParams.DARK_MODE, value);
  darkMode.value = value;
  applyDarkMode(value);
  updateTab();
}

function updateTab() {
  const tempValue = activeTab.value;
  activeTab.value = undefined;
  setTimeout(() => {
    activeTab.value = tempValue;
  }, 50);
}
</script>

<style scoped>
.popup-shell {
  min-height: 100%;
  padding: 14px 0 10px;
}

.headerBlock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
  backdrop-filter: blur(12px);
}

.headerBlock .brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.headerBlock .header {
  font-size: 15px;
  padding: 0;
  margin: 0;
  display: block;
  font-weight: 800;
  color: var(--hero-foreground);
  line-height: 1.15;
}

.headerBlock .eyebrow {
  margin: 0 0 3px;
  color: var(--hero-default-500);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.headerBlock .brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 0;
  border-radius: 10px;
  color: var(--hero-primary);
  background: var(--hero-primary-soft);
  border: 1px solid rgba(0, 111, 238, 0.18);
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.18);
}
.headerBlock .icons-block {
  float: none;
  margin: 0;
}

.headerBlock .icons-block > div {
  display: flex;
  gap: 6px;
}

.headerBlock .icons-block .icon-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  color: var(--hero-foreground);
  cursor: pointer;
  transition:
    transform 0.16s ease,
    background-color 0.16s ease,
    border-color 0.16s ease;
}

.headerBlock .icons-block .icon-button:hover {
  background: var(--hero-content1);
  border-color: rgba(0, 111, 238, 0.35);
  transform: translateY(-1px);
}

.sync-strip {
  display: flex;
  justify-content: flex-end;
  margin: 8px 16px 0;
}
</style>
