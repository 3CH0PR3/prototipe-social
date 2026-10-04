<script setup>
import { Moon, Sun } from '@lucide/vue';

defineProps({
  isDark: { type: Boolean, default: false },
  toggleTheme: Function
});
</script>

<template>
  <div>
    <button
      type="button"
      class="rounded p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
      @click="toggleTheme($event)"
    >
      <Sun v-if="isDark" class="h-5 w-5" />
      <Moon v-else class="h-5 w-5" />
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
