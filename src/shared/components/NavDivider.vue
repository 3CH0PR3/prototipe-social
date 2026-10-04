<script setup>
defineProps({
  title: { type: String, required: true }
});
</script>

<template>
  <div class="flex items-center pt-5 pb-1 -ml-3 select-none">
    <div class="h-[1px] w-4 shrink-0 bg-slate-200 dark:bg-slate-800" />
    <span
      v-if="title"
      class="ml-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap overflow-hidden"
    >
      {{ title }}
    </span>
  </div>
</template>
