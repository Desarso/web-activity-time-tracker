<template>
  <label class="hero-input" :class="{ readonly: readonly, disabled: disabled }">
    <span v-if="label" class="hero-input-label">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      @input="onInput"
      @change="$emit('change', $event)"
    />
  </label>
</template>

<script lang="ts">
export default {
  name: 'HeroInput',
};
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    type?: string;
    readonly?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    type: 'text',
    readonly: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'change', value: Event): void;
}>();

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<style scoped>
.hero-input {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.hero-input-label {
  color: var(--hero-default-500);
  font-size: 13px;
  font-weight: 800;
}

.hero-input input {
  width: 100%;
  min-height: 42px;
  box-sizing: border-box;
  padding: 0 14px;
  color: var(--hero-foreground);
  background: var(--hero-content1);
  border: 1px solid var(--hero-default-200);
  border-radius: var(--hero-radius-md);
  box-shadow: var(--hero-shadow-sm);
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  outline: none;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.hero-input input:focus {
  border-color: var(--hero-primary);
  box-shadow: var(--hero-ring);
}

.hero-input.readonly input,
.hero-input.disabled input {
  color: var(--hero-default-500);
  background: var(--hero-default-100);
}

.hero-input.disabled {
  opacity: 0.65;
}
</style>
