<script setup>
defineProps({
  rows: { type: Number, default: 10 },
  columns: { type: Number, default: 5 },
  hasExpand: { type: Boolean, default: false },
  hasActions: { type: Boolean, default: true },
  actionsCount: { type: Number, default: 3 }
});
</script>

<template>
  <tr v-for="i in rows" :key="i" class="animate-pulse">
    <td v-if="hasExpand" class="w-10 px-3 py-3">
      <div class="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />
    </td>
    <td v-for="col in columns" :key="col" class="px-4 py-3">
      <div class="h-4 rounded bg-slate-200 dark:bg-slate-700" :style="{ width: col === 1 ? '70%' : '50%' }" />
    </td>
    <td v-if="hasActions" class="px-4 py-3">
      <div class="flex justify-center gap-2">
        <div v-for="j in actionsCount" :key="j" class="h-7 w-7 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </td>
  </tr>
</template>
