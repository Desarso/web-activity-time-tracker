<template>
  <div class="chart">
    <Doughnut :data="data" :options="options" v-if="data != undefined" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'DonutChart',
};
</script>

<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { convertSummaryTimeToString } from '../utils/converter';
import { injectStorage } from '../storage/inject-storage';
import { onMounted, ref } from 'vue';
import { DARK_MODE_DEFAULT, StorageParams } from '../storage/storage-params';

const props = defineProps<{
  time: number[];
  labels: string[];
}>();

const settingsStorage = injectStorage();
const darkMode = ref();
const data = ref();
const options = ref();

onMounted(async () => {
  darkMode.value = await settingsStorage.getValue(StorageParams.DARK_MODE, DARK_MODE_DEFAULT);
  if (darkMode) {
    data.value = {
      labels: props.labels,
      datasets: [
        {
          borderWidth: 2,
          borderColor: darkMode.value ? '#18181b' : '#ffffff',
          color: '#fff',
          backgroundColor: [
            '#006fee',
            '#17c964',
            '#f5a524',
            '#f31260',
            '#7828c8',
            '#00b7fa',
            '#ff4ecd',
            '#9353d3',
            '#45d483',
            '#f9cb80',
          ],
          data: props.time,
        },
      ],
    };
    options.value = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: darkMode.value ? '#d4d4d8' : '#71717a',
          },
        },
        legendDistance: {
          padding: 50,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return convertSummaryTimeToString(context.raw);
            },
          },
        },
      },
    };
  }

  ChartJS.register(ArcElement, Tooltip, Legend);
});
</script>

<style scoped>
.chart {
  height: 230px;
  margin: auto;
  width: 80%;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
