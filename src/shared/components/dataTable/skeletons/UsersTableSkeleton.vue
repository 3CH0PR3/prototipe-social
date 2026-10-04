<script setup>
import DataTableSkeleton from './DataTableSkeleton.vue';
defineProps({ rows: { type: Number, default: 10 } });
</script>

<template>
  <!-- columns: usuario, email, rol, estado, registro = 5 | actions: ver, editar, eliminar = 3 -->
  <DataTableSkeleton :rows="rows" :columns="5" :actions-count="3" />
</template>
