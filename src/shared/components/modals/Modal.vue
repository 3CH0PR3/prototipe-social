<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { X } from '@lucide/vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  textFooter: { type: String, default: '' },
  headClass: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  footerClass: { type: String, default: '' },
  size: { type: String, default: 'modal-md' },
  centered: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  staticBackdrop: { type: Boolean, default: true },
  disableCancel: { type: Boolean, default: false },
  form: { type: Object, default: null },
  height: { type: Number, default: null }
});

const emit = defineEmits(['closed']);

const isOpen = ref(false);
const modalElement = ref(null);

const sizeMap = {
  'modal-sm': 'max-w-md',
  'modal-md': 'max-w-xl',
  'modal-lg': 'max-w-3xl',
  'modal-xl': 'max-w-4xl',
  'modal-full': 'max-w-7xl'
};
const sizeClass = () => sizeMap[props.size] ?? props.size;

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;

  if (props.form) {
    props.form.clearErrors?.();
    props.form.reset?.();
  }

  emit('closed');
};

const handleBackdropClick = (e) => {
  if (!props.staticBackdrop && !props.disableCancel && e.target === e.currentTarget) {
    close();
  }
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && !props.disableCancel) {
    close();
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

watch(isOpen, (val) => {
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
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.classList.remove('overflow-hidden');
});

defineExpose({ open, close, isOpen: () => isOpen.value });
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
        :id="id"
        ref="modalElement"
        class="fixed inset-0 z-[1000] flex overflow-y-auto bg-slate-950/30 backdrop-blur-lg px-4 py-8"
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
          <div
            class="relative w-full border border-slate-200/50 dark:border-slate-700/50 rounded-md bg-white shadow-xl dark:bg-slate-900"
            :class="[sizeClass(), scrollable ? 'flex max-h-[90vh] flex-col' : '']"
            @click.stop
          >
            <!-- HEADER -->
            <div
              v-if="$slots.header || title"
              class="flex items-center justify-between rounded-t-md border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60"
              :class="headClass"
            >
              <slot name="header">
                <div>
                  <h5 v-if="title" class="text-base font-semibold text-slate-900 dark:text-white">
                    {{ title }}
                  </h5>
                  <p v-if="subtitle" class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {{ subtitle }}
                  </p>
                </div>
              </slot>

              <button
                type="button"
                class="ml-3 shrink-0 rounded p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                :disabled="disableCancel"
                @click="!disableCancel && close()"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- BODY -->
            <div
              class="py-5"
              :class="[props.bodyClass, props.scrollable ? 'overflow-y-auto md:overflow-visible flex-1' : '']"
              :style="height ? { height: `${height}px` } : {}"
            >
              <slot name="body" />
            </div>

            <!-- FOOTER -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 rounded-b-md border-t border-slate-200 bg-slate-50 py-4 dark:border-slate-800 dark:bg-slate-800/60"
              :class="footerClass"
            >
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="btn-secondary"
                  :disabled="form?.processing || disableCancel"
                  @click="close"
                >
                  Cancelar
                </button>
                <slot name="footer" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
