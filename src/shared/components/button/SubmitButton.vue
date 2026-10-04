<script setup>
import { Loader } from '@lucide/vue';
import { Loader2 } from '@lucide/vue';

defineOptions({ inheritAttrs: false });

defineProps({
  type: { type: String, default: 'submit' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: 'Procesando' },
  variant: { type: String, default: 'primary' },
  block: { type: Boolean, default: true }
});

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  warning: 'btn-warning'
};
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled || loading"
    :class="[block ? 'w-full' : '', variants[variant] || variants.primary]"
  >
    <Loader v-if="loading" class="h-4 w-4 animate-spin" />
    <span v-if="loading">{{ loadingText }}</span>
    <slot v-else />
  </button>
</template>
