<script setup>
import { X, RefreshCcw } from '@lucide/vue';

defineProps({
  show: Boolean,
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  placement: { type: String, default: 'right' }, // right | left
  size: { type: String, default: 'md' }, // sm | md | lg | full
  showReset: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: false },
  backdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['close']);

const sizeClasses = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[32rem]',
  full: 'w-full'
};

const placementClasses = {
  right: 'right-0 top-0 bottom-0',
  left: 'left-0 top-0 bottom-0'
};

const slideFrom = {
  right: 'translate-x-full',
  left: '-translate-x-full'
};

const close = () => emit('close');

const refreshToken = localStorage.getItem('refresh_token');
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div v-if="show && backdrop" class="fixed inset-0 z-[100] backdrop-blur-sm" @click="close" />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      :enter-from-class="slideFrom[placement]"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      :leave-to-class="slideFrom[placement]"
    >
      <div
        v-if="show"
        class="fixed z-[101] flex flex-col bg-white dark:bg-slate-900 shadow-2xl"
        :class="[sizeClasses[size], placementClasses[placement]]"
        role="dialog"
        aria-modal="true"
      >
        <!-- HEADER -->
        <div
          class="flex gap-2 shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"
        >
          <div class="flex-1 min-w-0">
            <slot name="header" />
          </div>

          <div class="relative ms-auto">
            <button
              v-if="showReset"
              class="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Resetear"
              @click="reset"
            >
              <RefreshCcw class="h-5 w-5 -rotate-45" />
            </button>

            <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          </div>

          <button
            v-if="showClose"
            class="shrink-0 rounded p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar"
            @click="close"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- BODY -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <slot name="body" />
        </div>

        <!-- FOOTER -->
        <div v-if="showFooter" class="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
</style>
