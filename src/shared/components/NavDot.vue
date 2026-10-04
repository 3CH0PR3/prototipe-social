<script setup>
defineProps({ active: { type: Boolean, default: false } });
</script>

<template>
  <span class="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
    <span
      class="absolute inset-0 rounded-full transition-colors duration-200"
      :class="active ? 'bg-brand-500/20' : 'bg-transparent'"
    ></span>
    <span
      class="relative h-1.5 w-1.5 rounded-full transition-colors duration-200"
      :class="active ? 'bg-brand-500' : 'bg-slate-400'"
    ></span>
  </span>
</template>
