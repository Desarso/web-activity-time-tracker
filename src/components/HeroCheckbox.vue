<template>
  <label class="hero-checkbox" :class="{ checked: modelValue, disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="hero-checkbox-control">
      <span v-if="modelValue" class="hero-checkbox-check">✓</span>
    </span>
    <span class="hero-checkbox-content">
      <span class="hero-checkbox-label">{{ label }}</span>
      <span v-if="description" class="hero-checkbox-description">{{ description }}</span>
    </span>
  </label>
</template>

<script lang="ts">
export default {
  name: 'HeroCheckbox',
};
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    modelValue?: boolean;
    label: string;
    description?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: false,
    description: '',
    disabled: false,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'change', value: boolean): void;
}>();

function onChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  emit('update:modelValue', checked);
  emit('change', checked);
}
</script>

<style scoped>
.hero-checkbox {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  cursor: pointer;
}

.hero-checkbox input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.hero-checkbox-control {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  color: #fff;
  background: var(--hero-content1);
  border: 2px solid var(--hero-default-300, var(--hero-default-400));
  border-radius: 6px;
  box-sizing: border-box;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.hero-checkbox-check {
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
}

.hero-checkbox.checked .hero-checkbox-control {
  background: var(--hero-primary);
  border-color: var(--hero-primary);
  box-shadow: 0 0 0 4px var(--hero-primary-soft);
}

.hero-checkbox-content {
  display: grid;
  gap: 5px;
}

.hero-checkbox-label {
  color: var(--hero-foreground);
  font-size: 15px;
  font-weight: 800;
}

.hero-checkbox-description {
  color: var(--hero-default-500);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.hero-checkbox.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
