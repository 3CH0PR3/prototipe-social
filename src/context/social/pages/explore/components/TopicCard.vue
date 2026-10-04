<script setup>
import { Compass, ArrowUpRight } from '@lucide/vue';

defineProps({
  topic: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <button
    class="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#009F55]/30 transition-all text-left focus:outline-none group w-full"
    type="button"
  >
    <div class="flex items-center gap-4">
      <span
        class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#009F55]/10 group-hover:text-[#009F55] transition-colors"
      >
        <Compass :size="24" />
      </span>
      <span class="flex flex-col">
        <b class="text-base font-bold text-gray-900">{{ topic.title }}</b>
        <small class="text-sm text-gray-500 mt-0.5">{{ topic.count }}</small>
      </span>
    </div>
    <ArrowUpRight :size="20" class="text-gray-300 group-hover:text-[#009F55] transition-colors" />
  </button>
</template>
