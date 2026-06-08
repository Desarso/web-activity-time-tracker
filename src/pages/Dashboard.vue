<template>
  <notifications position="bottom right" />
  <div class="settings-tabs">
    <div class="header-block">
      <span class="brand-icon"><TablerIcon name="stopwatch" :size="34" :stroke="2.2" /></span>
      <div class="brand-text">
        <p class="eyebrow">{{ t('settings.message') }}</p>
        <p class="d-inline-block title">Web Activity Time Tracker</p>
      </div>
    </div>
    <div class="settings-tab mt-20">
      <input
        type="radio"
        id="timeIntervalChart-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Dashboard || selectedTab == SettingsTab.WebsiteStats"
        v-on:change="selectTab(SettingsTab.Dashboard)"
      />
      <label name="tabName" for="timeIntervalChart-tab"
        ><TablerIcon class="nav-icon" name="layout-dashboard" :size="30" />{{
          t('dashboard.message')
        }}</label
      >

      <div class="settings-content">
        <DashboadContainer
          v-if="selectedTab == SettingsTab.Dashboard || selectedTab == SettingsTab.WebsiteStats"
          :type="selectedTab"
          :domain="selectedWebsite"
        />
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="sync-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Sync"
        v-on:change="selectTab(SettingsTab.Sync)"
      />
      <label name="tabName" for="sync-tab"
        ><TablerIcon class="nav-icon" name="devices" :size="30" />Sync & devices</label
      >

      <div class="settings-content">
        <div class="main">
          <SyncSettings v-if="selectedTab == SettingsTab.Sync" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="white-list-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.WhiteList"
        v-on:change="selectTab(SettingsTab.WhiteList)"
      />
      <label name="tabName" for="white-list-tab"
        ><TablerIcon class="nav-icon" name="eye" :size="30" />{{
          t('whiteListSettings.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <WhiteList v-if="selectedTab == SettingsTab.WhiteList" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="limits-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Limits"
        v-on:change="selectTab(SettingsTab.Limits)"
      />
      <label name="tabName" for="limits-tab"
        ><TablerIcon class="nav-icon" name="hourglass-empty" :size="30" />{{
          t('limitsSettings.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <Limits v-if="selectedTab == SettingsTab.Limits" />
        </div>
      </div>
    </div>
    <div class="settings-tab">
      <input
        type="radio"
        id="notification-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Notifications"
        v-on:change="selectTab(SettingsTab.Notifications)"
      />
      <label name="tabName" for="notification-tab"
        ><TablerIcon class="nav-icon" name="bell" :size="30" />{{
          t('notificationsSettings.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <DailyNotifications v-if="selectedTab == SettingsTab.Notifications" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="pomodoro-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Pomodoro"
        v-on:change="selectTab(SettingsTab.Pomodoro)"
      />
      <label name="tabName" for="pomodoro-tab"
        ><TablerIcon class="nav-icon" name="clock-play" :size="30" />{{
          t('pomodoroMode.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <Pomodoro v-if="selectedTab == SettingsTab.Pomodoro" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="general-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.GeneralSettings"
        v-on:change="selectTab(SettingsTab.GeneralSettings)"
      />
      <label name="tabName" for="general-tab"
        ><TablerIcon class="nav-icon" name="settings" :size="30" />{{
          t('generalSettings.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <GeneralSettings v-if="selectedTab == SettingsTab.GeneralSettings" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="about-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.About"
        v-on:change="selectTab(SettingsTab.About)"
      />
      <label class="about" name="tabName" for="about-tab"
        ><TablerIcon class="nav-icon" name="user-circle" :size="30" />{{
          t('aboutSettings.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <About v-if="selectedTab == SettingsTab.About" />
        </div>
      </div>
    </div>

    <div class="settings-tab">
      <input
        type="radio"
        id="donate-tab"
        name="settings-group"
        :checked="selectedTab == SettingsTab.Donate"
        v-on:change="selectTab(SettingsTab.Donate)"
      />
      <label name="tabName" for="donate-tab" class="donate"
        ><TablerIcon class="nav-icon" name="heart-handshake" :size="30" />{{
          t('donate.message')
        }}</label
      >

      <div class="settings-content">
        <div class="main">
          <Donation v-if="selectedTab == SettingsTab.Donate" />
        </div>
      </div>
    </div>

    <PromoCleanYoutubeModal />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralSettings from '../components/GeneralSettings.vue';
import PromoCleanYoutubeModal from '../components/PromoCleanYoutubeModal.vue';
import WhiteList from '../components/WhiteList.vue';
import Limits from '../components/Limits.vue';
import DailyNotifications from '../components/Notifications.vue';
import Pomodoro from '../components/Pomodoro.vue';
import SyncSettings from '../components/SyncSettings.vue';
import About from '../components/About.vue';
import { SettingsTab } from '../utils/enums';
import DashboadContainer from '../components/DashboadContainer.vue';
import { useExtensionPage } from '../compositions/useExtensionPage';
import { getEnumValueTab } from '../utils/extension-tabs';
import { applyDarkMode } from '../utils/dark-mode';
import { injectStorage } from '../storage/inject-storage';
import { StorageParams, DARK_MODE_DEFAULT } from '../storage/storage-params';
import Donation from '../components/Donation.vue';
import TablerIcon from '../components/TablerIcon.vue';

const { t } = useI18n();
const extensionPage = useExtensionPage();
const settingsStorage = injectStorage();

const selectedTab = ref<SettingsTab>();
const currentUrl = ref(new URL(location.href));
const selectedWebsite = ref<string>();
const darkMode = ref<boolean>();

watch(currentUrl, () => {
  getCurrentTab();
});

onMounted(async () => {
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  applyDarkMode(darkMode.value!);
  getCurrentTab();
});

function getCurrentTab() {
  const tabName = currentUrl.value.searchParams.get('tab');
  if (tabName != null && tabName != '') {
    selectedTab.value = getEnumValueTab(tabName);
    const domain = currentUrl.value.searchParams.get('website');
    if (selectedTab.value == SettingsTab.WebsiteStats) {
      if (domain != null && domain != '') selectedWebsite.value = domain;
      else selectedTab.value = SettingsTab.Dashboard;
    } else if (domain != null && domain != '') {
      window.history.replaceState(
        location.href,
        document.title,
        location.href.replace(`&website=${domain}`, ''),
      );
    }
  }
  if (selectedTab.value == undefined) selectedTab.value = SettingsTab.Dashboard;
}

function selectTab(value: SettingsTab) {
  selectedTab.value = value;
  extensionPage.updateTab(value);
  currentUrl.value = new URL(location.href);
}
</script>

<style scoped>
.main {
  width: min(980px, 100%);
  margin: 0;
}
.header-block {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 292px;
  padding: 20px 16px 18px;
  background-color: transparent !important;
}
.header-block .title {
  vertical-align: top;
  margin: 0;
  font-weight: 800;
  font-size: 15px;
  line-height: 1.2;
  color: var(--hero-foreground);
}
.header-block .eyebrow {
  margin: 0 0 4px;
  color: var(--hero-default-500);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}
.header-block .brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin: 0;
  border-radius: 12px;
  color: var(--hero-primary);
  background: var(--hero-primary-soft);
  border: 1px solid rgba(0, 111, 238, 0.18);
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.18);
}
.header-block .brand-text {
  min-width: 0;
}
.tab-separator {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 600;
}
.about {
  width: 260px !important;
}
.donate {
  width: 260px !important;
}
</style>
