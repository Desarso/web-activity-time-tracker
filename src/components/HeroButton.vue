<template>
  <button
    type="button"
    class="hero-button"
    :class="[variant, size]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script lang="ts">
export default {
  name: 'HeroButton',
};
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md';
    disabled?: boolean;
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    disabled: false,
  },
);

defineEmits<{
  (event: 'click', value: MouseEvent): void;
}>();
</script>

<style scoped>
.hero-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: var(--hero-radius-md);
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.hero-button.primary {
  color: #fff;
  background: var(--hero-primary);
  box-shadow: 0 8px 18px rgba(0, 111, 238, 0.22);
}

.hero-button.secondary {
  color: var(--hero-foreground);
  background: var(--hero-default-100);
  border: 1px solid var(--hero-default-200);
}

.hero-button.danger {
  color: var(--hero-danger);
  background: var(--hero-danger-soft);
  border: 1px solid rgba(243, 18, 96, 0.22);
}

.hero-button.sm {
  min-height: 32px;
  padding: 0 12px;
  font-size: 12px;
}

.hero-button:disabled {
  color: var(--hero-default-400);
  background: var(--hero-default-100);
  border-color: var(--hero-default-200);
  box-shadow: none;
  cursor: not-allowed;
}
</style>
