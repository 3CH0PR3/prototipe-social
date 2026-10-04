<script setup>
import { computed, watch } from 'vue';

const emit = defineEmits(['update:checked']);

const props = defineProps({
  label: { type: String, default: '' },
  checked: { type: [Array, Boolean], required: true },
  value: { default: null },
  error: { type: Boolean, default: false },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).slice(2, 9)}`
  }
});

const proxyChecked = computed({
  get: () => props.checked,
  set: (val) => emit('update:checked', val)
});
</script>

<template>
  <label
    :for="id"
    :class="[
      'inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium',
      error ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
    ]"
  >
    <input :id="id" v-model="proxyChecked" type="checkbox" :value="value" class="checkbox-field" />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
