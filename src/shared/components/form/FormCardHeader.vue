<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  iconBg: { type: String, default: 'bg-brand-100 dark:bg-brand-950' },
  iconColor: { type: String, default: 'text-brand-600 dark:text-brand-400' }
});
</script>

<template>
  <div class="mb-6 text-center">
    <div :class="['mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded', iconBg, iconColor]">
      <slot name="icon" />
    </div>
    <h3 class="text-lg font-extrabold text-slate-800 dark:text-slate-200">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
      {{ description }}
    </p>
  </div>
</template>
