<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { X } from '@lucide/vue';
import PerfectScrollbar from '@shared/plugins/perfect-scrollbar/PerfectScrollbar.vue';

const props = defineProps({
  title: { type: String, required: true },
  isOpen: { type: Boolean, required: true },
  size: { type: String, default: 'modal-md' },
  maxWidth: { type: String, default: '' },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  headClass: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  footerClass: { type: String, default: '' },
  perfectScrollbar: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const modalElement = ref(null);

const sizeMap = {
  'modal-sm': 'max-w-lg',
  'modal-md': 'max-w-xl',
  'modal-lg': 'max-w-3xl',
  'modal-xl': 'max-w-4xl',
  'modal-full': 'max-w-7xl'
};
const sizeClass = () => {
  if (props.maxWidth) return props.maxWidth;
  return sizeMap[props.size] ?? props.size;
};

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }

  if (e.key === 'Tab') {
    const focusable =
      modalElement.value?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? [];

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.classList.add('overflow-hidden');
      document.addEventListener('keydown', handleKeydown);

      nextTick(() => {
        const firstFocusable = modalElement.value?.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        firstFocusable?.focus();
      });
    } else {
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeydown);
    }
  }
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.classList.remove('overflow-hidden');
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        ref="modalElement"
        class="soc-modal-overlay"
        :class="centered ? 'items-center justify-center' : 'items-start justify-center pt-16'"
        tabindex="-1"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          enter-from-class="opacity-0 translate-y-4 scale-[0.97]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          appear
        >
          <section
            class="soc-modal-container"
            :class="[sizeClass(), scrollable ? 'flex max-h-[90vh] flex-col' : '']"
            @click.stop
          >
            <!-- HEADER -->
            <header class="soc-modal-header" :class="headClass">
              <h2 class="soc-modal-title">{{ title }}</h2>
              <button class="soc-modal-close-btn" @click="emit('close')">
                <X :size="18" />
              </button>
            </header>

            <!-- BODY -->
            <div
              v-if="!perfectScrollbar"
              class="soc-modal-body"
              :class="[bodyClass, scrollable ? 'overflow-y-auto flex-1' : '']"
            >
              <slot />
            </div>

            <PerfectScrollbar
              v-if="perfectScrollbar"
              class="soc-modal-body"
              :class="[bodyClass, scrollable ? 'overflow-y-auto flex-1' : '']"
            >
              <slot />
            </PerfectScrollbar>

            <!-- FOOTER -->
            <div v-if="$slots.footer" class="soc-modal-footer" :class="footerClass">
              <slot name="footer"></slot>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
