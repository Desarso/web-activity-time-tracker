<template>
  <div class="donation-panel">
    <p class="title">
      {{ t('enjoy.message') }}
    </p>

    <p>
      {{ t('canDonate.message') }}
    </p>

    <div class="mt-30">
      <p>{{ t('coin.message') }} <span class="font-bold"> USDT </span></p>
      <p>{{ t('chain.message') }}<span class="font-bold"> Ethereum (ERC20) </span></p>
      <p>
        {{ t('address.message') }}
        <span class="font-bold"> 0x427a22e1f4ba81351c22465faf6cfcf6095583d1 </span>
      </p>
    </div>

    <img class="mt-15" src="../assets/icons/donation-qr.png" />

    <p class="font-bold mt-30">
      {{ t('thanks.message') }}
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Donation',
};
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
p {
  font-size: 15px;
}
.title {
  font-size: 18px !important;
  font-weight: 850;
  color: var(--hero-foreground);
}
.donation-panel {
  padding: 22px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-sm);
}
.donation-panel p {
  color: var(--hero-default-500);
  line-height: 1.5;
}
.donation-panel img {
  border-radius: var(--hero-radius-lg);
  border: 1px solid var(--hero-default-200);
  box-shadow: var(--hero-shadow-sm);
}
</style>
