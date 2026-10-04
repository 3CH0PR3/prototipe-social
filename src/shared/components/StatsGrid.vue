<script setup>
import { computed } from 'vue';
import { Users, UserCheck, UserX, Shield } from '@lucide/vue';
import StatsCard from './StatsCard.vue';

const props = defineProps({
  users: { type: Array, default: () => [] },
  columns: { type: Number, default: 4 }
});

// Calcular estadísticas internamente
const statsCards = computed(() => [
  {
    label: 'Total Usuarios',
    value: props.users?.length || 0,
    icon: Users,
    bgClass: 'bg-brand-100 dark:bg-brand-950/30',
    iconClass: 'text-brand-600 dark:text-brand-400',
    valueClass: 'text-slate-900 dark:text-slate-100'
  },
  {
    label: 'Activos',
    value: props.users?.filter((u) => u.status_code === 1).length || 0,
    icon: UserCheck,
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/30',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    valueClass: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    label: 'Inactivos',
    value: props.users?.filter((u) => u.status_code === 0).length || 0,
    icon: UserX,
    bgClass: 'bg-rose-100 dark:bg-rose-950/30',
    iconClass: 'text-rose-600 dark:text-rose-400',
    valueClass: 'text-rose-600 dark:text-rose-400'
  },
  {
    label: 'Administradores',
    value: props.users?.filter((u) => u.roles?.some((r) => r.name.includes('admin'))).length || 0,
    icon: Shield,
    bgClass: 'bg-accent-100 dark:bg-accent-950/30',
    iconClass: 'text-accent-600 dark:text-accent-400',
    valueClass: 'text-accent-600 dark:text-accent-400'
  }
]);
</script>

<template>
  <div
    class="grid gap-4 mb-0"
    :class="{
      'sm:grid-cols-2 lg:grid-cols-4': columns === 4,
      'sm:grid-cols-2 lg:grid-cols-3': columns === 3,
      'sm:grid-cols-2': columns === 2
    }"
  >
    <StatsCard v-for="(stat, index) in statsCards" :key="index" v-bind="stat" />
  </div>
</template>
