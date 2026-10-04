<script setup>
import { ShieldCheck } from '@lucide/vue';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  variant: { type: String, default: 'info' } // info | warning
});
</script>

<template>
  <div
    class="flex items-start gap-3 rounded border p-4"
    :class="
      variant === 'warning'
        ? 'border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30'
        : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
    "
  >
    <div class="shrink-0 rounded-lg p-1" :class="variant === 'warning' ? 'text-amber-600' : 'text-brand-500'">
      <slot name="icon">
        <ShieldCheck class="h-5 w-5" />
      </slot>
    </div>
    <div>
      <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
        {{ title }}
      </p>
      <p v-if="description" class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </div>
  </div>
</template>
