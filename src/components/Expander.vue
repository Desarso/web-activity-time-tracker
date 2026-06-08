<template>
  <div class="expander">
    <div class="expander-trigger" @click="open = !open" :class="open ? 'active' : 'beforeBorder'">
      <div class="d-inline-block">
        <svg
          class="expander-trigger-Icon"
          :class="{ open: open }"
          width="40"
          height="12"
          stroke="cornflowerblue"
        >
          <polyline points="12,2 20,10 28,2" stroke-width="3" fill="none"></polyline>
        </svg>
      </div>
      <div class="header">
        {{ day }}
        <span>{{ convertSummaryTimeToString(time) }}</span>
      </div>
    </div>
    <transition name="leftToRight">
      <div class="expander-body" v-show="open">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Expander',
};
</script>

<script lang="ts" setup>
import { ref } from 'vue';
import { convertSummaryTimeToString } from '../utils/converter';

const props = defineProps<{
  day: string;
  time: number;
}>();

const open = ref<boolean>();
</script>

<style scoped>
.header {
  display: inline-block;
  width: 90%;
  color: var(--hero-foreground);
  font-weight: 850;
}
.header span {
  font-weight: 850;
  font-size: 13px;
  color: var(--hero-primary);
  float: right;
}
.expander {
  margin: 10px 16px;
  overflow: hidden;
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  background: var(--hero-content1);
  box-shadow: var(--hero-shadow-sm);
}
.expander-trigger {
  cursor: pointer;
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid transparent;
  background: var(--hero-content1);
}
.expander-trigger:hover {
  color: var(--hero-primary);
  background: var(--hero-default-100);
}
.expander-trigger.active {
  border-bottom-color: var(--hero-default-200);
}
.expander-trigger-Icon {
  transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  stroke: var(--hero-primary);
}
.expander-trigger-Icon.open {
  stroke: var(--hero-primary);
  transform: rotate(180deg);
}
.expander-body {
  padding: 6px 0 10px;
  background: var(--hero-default-100);
}
.leftToRight-enter-active {
  -webkit-animation: leftToRight 0.5s;
  animation: leftToRight 0.5s;
}
.leftToRight-leave-active {
  animation: leftToRight 0.5s reverse;
}
@-webkit-keyframes leftToRight {
  0% {
    transform: translateX(-100vw);
  }
  50% {
    transform: translateX(2em);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes leftToRight {
  0% {
    transform: translateX(-100vw);
  }
  50% {
    transform: translateX(2em);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
