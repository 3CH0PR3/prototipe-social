<script setup>
defineProps({
  value: { type: String, default: '' },
  forId: { type: String, default: '' },
  required: { type: Boolean, default: false },
  hint: { type: String, default: '' }
});
</script>

<template>
  <label :for="forId || undefined" class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
    <span v-if="value">{{ value }}</span>
    <span v-else><slot /></span>
    <span v-if="required" class="ml-0.5 text-rose-500">*</span>
  </label>
  <p v-if="hint" class="text-[10px] md:text-xs leading-none text-slate-500 dark:text-slate-400 pb-2">
    {{ hint }}
  </p>
</template>
