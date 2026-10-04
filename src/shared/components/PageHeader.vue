<script setup>
import { ArrowLeft } from '@lucide/vue';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  backHref: { type: String, default: '' },
  backLabel: { type: String, default: 'Volver' }
});
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <router-link
        v-if="backHref"
        :to="backHref"
        class="mb-2 inline-flex md:hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        {{ backLabel }}
      </router-link>
      <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
