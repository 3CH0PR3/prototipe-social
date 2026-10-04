<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Sun, Moon } from '@lucide/vue';

import { useThemeTransition } from '@shared/composables/useThemeTransition.js';

const { isDark, toggleWithTransition } = useThemeTransition();
</script>

<template>
  <div class="fixed w-full flex justify-end pe-3 pt-3 md:pe-4 md:pt-4">
    <button
      type="button"
      class="rounded p-2.5 transition text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
      @click="toggleWithTransition($event)"
    >
      <Sun v-if="isDark" class="h-5 w-5" />
      <Moon v-else class="h-5 w-5" />
    </button>
  </div>

  <main class="min-h-screen bg-white dark:bg-background">
    <router-view />
  </main>

</template>
