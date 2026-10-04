<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: [Object, Function], default: null },
  bgClass: { type: String, default: 'bg-brand-100 dark:bg-brand-950/30' },
  iconClass: { type: String, default: 'text-brand-600 dark:text-brand-400' },
  valueClass: { type: String, default: 'text-slate-900 dark:text-slate-100' }
});
</script>

<template>
  <div
    class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
            {{ label }}
          </p>
          <p class="mt-2 text-3xl font-bold" :class="valueClass">
            {{ value }}
          </p>
        </div>
        <div v-if="icon" class="flex h-12 w-12 items-center justify-center rounded-lg" :class="bgClass">
          <component :is="icon" class="h-6 w-6" :class="iconClass" />
        </div>
      </div>
    </div>
  </div>
</template>
