<script setup>
import DataTableSkeleton from './DataTableSkeleton.vue';
defineProps({ rows: { type: Number, default: 10 } });
</script>

<template>
  <DataTableSkeleton :rows="rows" :columns="5" :actions-count="3" />
</template>
