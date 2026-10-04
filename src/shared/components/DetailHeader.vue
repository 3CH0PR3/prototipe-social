<script setup>
import BackButton from '@shared/components/buttons/BackButton.vue';

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: null },
  showActionButton: { type: Boolean, default: false },
  actionButtonLabel: { type: String, default: 'Acción' },
  actionButtonIcon: { type: [Object, Function], default: null }
});

const emit = defineEmits(['action']);
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <BackButton />
      <div>
        <h1 class="text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h1>
        <p v-if="subtitle" class="text-xs text-slate-400 dark:text-slate-300">{{ subtitle }}</p>
      </div>
    </div>
    <button
      v-if="showActionButton"
      class="btn-secondary flex items-center gap-1.5"
      @click="emit('action')"
    >
      <component :is="actionButtonIcon" v-if="actionButtonIcon" class="h-4 w-4" />
      {{ actionButtonLabel }}
    </button>
  </div>
</template>
