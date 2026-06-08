<template>
  <div ref="root" class="hero-select" :class="{ open: isOpen, disabled }">
    <button
      type="button"
      class="hero-select-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-label="ariaLabel || placeholder"
      @click="toggle()"
      @keydown.esc="close()"
    >
      <span class="hero-select-value">{{ selectedOption?.label || placeholder }}</span>
      <span class="hero-select-caret">⌄</span>
    </button>
    <div v-if="isOpen" class="hero-select-menu" role="listbox">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="hero-select-option"
        :class="{ selected: option.value === modelValue }"
        role="option"
        :aria-selected="option.value === modelValue"
        @click="select(option)"
      >
        <span>{{ option.label }}</span>
        <span v-if="option.value === modelValue" class="hero-select-check">✓</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HeroSelect',
};
</script>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export type HeroSelectValue = string | number;
export type HeroSelectOption = {
  label: string;
  value: HeroSelectValue;
};

const props = withDefaults(
  defineProps<{
    modelValue?: HeroSelectValue;
    options: HeroSelectOption[];
    placeholder?: string;
    ariaLabel?: string;
    disabled?: boolean;
  }>(),
  {
    placeholder: 'Select',
    ariaLabel: '',
    disabled: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: HeroSelectValue): void;
  (event: 'change', value: HeroSelectValue): void;
}>();

const root = ref<HTMLElement>();
const isOpen = ref(false);
const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue));

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

function toggle() {
  if (!props.disabled) isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

function select(option: HeroSelectOption) {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  close();
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) close();
}
</script>

<style scoped>
.hero-select {
  position: relative;
  display: inline-block;
  min-width: 180px;
  vertical-align: middle;
}

.hero-select-trigger {
  width: 100%;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px 0 14px;
  color: var(--hero-foreground);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  box-shadow: var(--hero-shadow-sm);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.hero-select-trigger:hover,
.hero-select.open .hero-select-trigger {
  background: var(--hero-content1);
  border-color: rgba(0, 111, 238, 0.34);
}

.hero-select-trigger:focus-visible {
  border-color: var(--hero-primary);
  box-shadow: var(--hero-ring);
}

.hero-select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-select-caret {
  color: var(--hero-default-500);
  font-size: 18px;
  line-height: 1;
  transition: transform 0.16s ease;
}

.hero-select.open .hero-select-caret {
  transform: rotate(180deg);
}

.hero-select-menu {
  position: absolute;
  z-index: 30;
  top: calc(100% + 8px);
  left: 0;
  width: max(100%, 220px);
  max-height: 280px;
  overflow: auto;
  padding: 6px;
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-lg);
  box-shadow: var(--hero-shadow-md);
}

.hero-select-option {
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px;
  color: var(--hero-foreground);
  background: transparent;
  border: 0;
  border-radius: var(--hero-radius-md);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  text-align: left;
}

.hero-select-option:hover {
  background: var(--hero-default-100);
}

.hero-select-option.selected {
  color: var(--hero-primary);
  background: var(--hero-primary-soft);
}

.hero-select-check {
  color: var(--hero-primary);
  font-weight: 900;
}

.hero-select.disabled {
  opacity: 0.55;
  pointer-events: none;
}
</style>
