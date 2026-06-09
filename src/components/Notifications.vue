<template>
  <div>
    <div class="settings-item">
      <HeroCheckbox
        v-model="showDailyNotification"
        :label="t('showDailyNotification.message')"
        :description="t('showDailyNotification.description')"
        @change="save(StorageParams.DAILY_NOTIFICATION, $event)"
      />
    </div>
    <div class="settings-item">
      <p class="setting-header d-inline-block">
        {{ t('notificationTimeSetting.message') }}
      </p>
      <VueDatePicker
        v-model="notificationTime"
        time-picker
        @update:model-value="handleDate"
        class="date-picker d-inline-block"
      />
    </div>
    <div class="settings-item">
      <label class="setting-header">{{ t('notificationTime.message') }}</label>
      <p class="description">
        {{ t('notificationTime.description') }}
      </p>
      <ListWithTimeComponent :type="ListWithTime.Notifications" />
    </div>
    <div class="settings-item">
      <label class="setting-header">{{ t('notificationMessage.message') }}</label>
      <p class="description">
        {{ t('notificationMessage.description') }}
      </p>
      <div class="notification-message-row">
        <HeroInput
        :placeholder="t('enterNotification.message')"
        v-model="notificationMessage"
        />
        <HeroButton
          variant="primary"
          :disabled="notificationMessage == ''"
          @click="saveNotificationMessage()"
        >
          {{ t('save.message') }}
        </HeroButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DailyNotifications',
};
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectStorage } from '../storage/inject-storage';
import { NOTIFICATION_MESSAGE_DEFAULT, StorageParams } from '../storage/storage-params';
import {
  DAILY_NOTIFICATION_DEFAULT,
  DAILY_SUMMARY_NOTIFICATION_TIME_DEFAULT,
} from '../storage/storage-params';
import { convertHHMMToSeconds, convertSecondsToHHMM } from '../utils/converter';
import { Time } from '../utils/time';
import ListWithTimeComponent from '../components/ListWithTime.vue';
import { ListWithTime } from '../utils/enums';
import Browser from 'webextension-polyfill';
import { Messages } from '../utils/messages';
import HeroButton from './HeroButton.vue';
import HeroCheckbox from './HeroCheckbox.vue';
import HeroInput from './HeroInput.vue';

const { t } = useI18n();

const settingsStorage = injectStorage();

const showDailyNotification = ref<boolean>();
const dailyNotificationTime = ref<number>();
const notificationTime = ref<Time>();
const notificationMessage = ref<string>();

onMounted(async () => {
  showDailyNotification.value = await settingsStorage.getValue(
    StorageParams.DAILY_NOTIFICATION,
    DAILY_NOTIFICATION_DEFAULT,
  );

  notificationMessage.value = await settingsStorage.getValue(
    StorageParams.NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGE_DEFAULT,
  );

  dailyNotificationTime.value = (await settingsStorage.getValue(
    StorageParams.DAILY_SUMMARY_NOTIFICATION_TIME,
    DAILY_SUMMARY_NOTIFICATION_TIME_DEFAULT,
  )) as number;

  const timeObj = convertSecondsToHHMM(dailyNotificationTime.value);
  notificationTime.value = timeObj;
});

async function saveNotificationMessage() {
  save(StorageParams.NOTIFICATION_MESSAGE, notificationMessage.value);
}

async function handleDate(modelData: Time) {
  if (modelData != null) {
    notificationTime.value = modelData;
    await save(
      StorageParams.DAILY_SUMMARY_NOTIFICATION_TIME,
      convertHHMMToSeconds(notificationTime.value.hours, notificationTime.value.minutes),
    );
    Browser.runtime.sendMessage(Messages.RescheduleJobs);
  }
}

async function save(storageParam: StorageParams, value: any) {
  if (value != undefined) await settingsStorage.saveValue(storageParam, value);
}
</script>

<style scoped>
.date-picker {
  width: 120px;
  margin: 0 15px;
}
.notification-message-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
  max-width: 650px;
}
</style>
