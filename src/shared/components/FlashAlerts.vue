<script setup>
import { computed, watch, onUnmounted } from 'vue';
import { CheckCircle2, AlertCircle } from '@lucide/vue';
import { useFlashStore } from '@globalStores/useFlash.store';

const props = defineProps({
  autoClose: { type: Boolean, default: false }
});

const flashStore = useFlashStore();
let timeout = null;

// Vigilamos los cambios en el almacén de alertas para el autoClose
watch(
  () => [flashStore.success, flashStore.warning, flashStore.error],
  ([success, warning, error]) => {
    if (timeout) clearTimeout(timeout);

    if (props.autoClose && (success || warning || error)) {
      timeout = setTimeout(() => {
        flashStore.clear();
      }, 3000);
    }
  }
);

// Limpiamos el temporizador si el componente se destruye inesperadamente
onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});

const success = computed(() => flashStore.success);
const warning = computed(() => flashStore.warning);
const error = computed(() => flashStore.error);
</script>

<template>
  <div v-if="success || warning || error" class="mb-6 space-y-3">
    <div
      v-if="success"
      class="flex items-center gap-3 rounded border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
    >
      <CheckCircle2 class="h-5 w-5 shrink-0" />
      <span>{{ success }}</span>
    </div>

    <div
      v-if="warning"
      class="flex items-center gap-3 rounded border border-yellow-200/80 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-300"
    >
      <AlertCircle class="h-5 w-5 shrink-0" />
      <span>{{ warning }}</span>
    </div>

    <div
      v-if="error"
      class="flex items-center gap-3 rounded border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
    >
      <AlertCircle class="h-5 w-5 shrink-0" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>
