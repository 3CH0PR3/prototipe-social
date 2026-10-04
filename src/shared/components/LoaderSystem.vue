<script setup>
import { defineEmits, nextTick, onMounted, ref } from 'vue';

const emits = defineEmits(['loaded']);
const loading = ref(true);

onMounted(async () => {
  await nextTick();
  loading.value = false;
  emits('loaded');
});
</script>

<template>
  <div class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="relative">
      <div
        class="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500 dark:border-slate-800 dark:border-t-brand-400"
      />
    </div>
    <p class="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Cargando panel…</p>
  </div>
</template>
