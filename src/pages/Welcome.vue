<template>
  <div class="main">
    <template v-if="step == WelcomeStep.InitialView">
      <div class="initial-block">
        <div class="copy-block">
          <p class="kicker">Web Activity Time Tracker</p>
          <p class="header">{{ t('welcome.message') }}</p>
          <p class="description" v-html="t('welcome.description')"></p>
          <div class="next-btn">
            <SyncAccountActions />
            <button @click="nextStep()">{{ t('next.message') }}</button>
          </div>
        </div>
        <img class="img" src="../assets/initial.jpg" height="250" />
      </div>
    </template>
    <template v-if="step == WelcomeStep.Tutorial">
      <div class="steps">
        <div class="steps-header">
          <p class="kicker">Setup</p>
          <p class="header">{{ t('getStarted.message') }}</p>
          <p class="description">{{ t('welcomeStart.message') }}</p>
        </div>
        <div class="step-grid">
          <div class="step-card">
            <p class="step">1. {{ t('pinIcon.message') }}</p>
            <p class="description">
              {{ t('pinIconPart1.message') }}
              <img src="../assets/icons/extension.svg" height="25" />
              {{ t('pinIconPart2.message') }}
              <img src="../assets/icons/pin.svg" height="25" />
            </p>
            <img class="img tutorial" src="../assets/pin-tutorial.png" height="250" />
          </div>
          <div class="step-card">
            <p class="step">2. {{ t('browse.message') }}</p>
            <p class="description">
              {{ t('browse.description') }}
              <img src="../assets/icons/icon.png" height="35" />
            </p>
          </div>
          <div class="step-card">
            <p class="step">3. {{ t('seeData.message') }}</p>
            <p class="description">
              {{ t('seeData.description') }}
            </p>
          </div>
        </div>
        <div class="btn-block">
          <SyncAccountActions />
          <button class="close" @click="close()">{{ t('close.message') }}</button>
          <button @click="openDashboard()">{{ t('useExtension.message') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Browser from 'webextension-polyfill';
import SyncAccountActions from '../components/SyncAccountActions.vue';

const { t } = useI18n();

enum WelcomeStep {
  InitialView,
  Tutorial,
}

const step = ref<WelcomeStep>();

onMounted(() => {
  step.value = WelcomeStep.InitialView;
});

function nextStep() {
  step.value = WelcomeStep.Tutorial;
}

async function close() {
  const currentTab = await Browser.tabs.getCurrent();
  await Browser.tabs.remove(currentTab.id!);
}

async function openDashboard() {
  const url = Browser.runtime.getURL('src/dashboard.html?tab=dashboard');
  const tab = await Browser.tabs.query({ currentWindow: true, active: true });
  Browser.tabs.update(tab[0].id, { url: url });
}
</script>

<style scoped>
.main {
  min-height: 100vh;
  margin: 0;
  text-align: center;
  padding: 44px;
  color: var(--hero-foreground, #11181c);
  background:
    radial-gradient(circle at 18% 6%, rgba(0, 111, 238, 0.12), transparent 28%),
    linear-gradient(180deg, #fff 0%, #f7f8fb 52%);
}
.initial-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
  align-items: center;
  gap: 42px;
  min-height: calc(100vh - 88px);
  max-width: 1120px;
  margin: 0 auto;
  text-align: left;
}

.copy-block {
  padding: 34px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--hero-default-200, #e4e4e7);
  border-radius: 22px;
  box-shadow: var(--hero-shadow-md, 0 12px 32px rgba(15, 23, 42, 0.1));
  backdrop-filter: blur(12px);
}

.kicker {
  margin: 0 0 10px;
  color: var(--hero-primary, #006fee);
  font-size: 13px;
  font-weight: 850;
}

.header {
  margin: 0;
  font-size: 38px;
  font-weight: 850;
  line-height: 1.06;
}
.img {
  max-width: 100%;
  height: auto;
  margin: 0;
  border-radius: 22px;
  box-shadow: var(--hero-shadow-md, 0 12px 32px rgba(15, 23, 42, 0.1));
}
.description {
  color: var(--hero-default-500, #71717a);
  font-size: 17px;
  line-height: 1.6;
}
.description span {
  font-weight: 600;
}
.description img {
  margin: 0 10px;
}
.steps {
  max-width: 1080px;
  margin: 0 auto;
}

.steps-header {
  margin: 0 auto 26px;
  max-width: 720px;
}

.steps .step {
  text-align: left;
  font-size: 21px;
  font-weight: 850;
  color: var(--hero-foreground, #11181c);
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.step-card {
  min-height: 210px;
  padding: 22px;
  text-align: left;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--hero-default-200, #e4e4e7);
  border-radius: 18px;
  box-shadow: var(--hero-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.06));
}

.step-card:first-child {
  grid-column: span 3;
}

.step-card .description {
  margin: 14px 0 0;
}

.img.tutorial {
  display: block;
  margin: 18px auto 0;
}

.next-btn {
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

button.close {
  background: var(--hero-default-100, #f4f4f5);
  color: var(--hero-foreground, #11181c);
  box-shadow: none;
}

button {
  display: inline-block;
  background: var(--hero-primary, #006fee);
  color: #fff;
  border-radius: 12px;
  min-height: 42px;
  line-height: 42px;
  padding: 0 16px;
  border: 0;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
  width: 200px;
  margin: 0 10px;
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.24);
}
.btn-block {
  margin: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .main {
    padding: 22px;
  }

  .initial-block,
  .step-grid {
    grid-template-columns: 1fr;
  }

  .step-card:first-child {
    grid-column: auto;
  }

  .header {
    font-size: 30px;
  }
}
</style>
