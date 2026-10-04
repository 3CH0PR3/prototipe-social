<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Check } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Seleccionar' },
  disabled: { type: Boolean, default: false },
  width: { type: String, default: 'w-full' },
  error: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const containerRef = ref(null);
const psRef = ref(null); // ref al PerfectScrollbar

const selectedLabel = computed(() => {
  const found = props.options.find((o) => String(o.value) === String(props.modelValue));
  return found ? found.label : props.placeholder;
});

const isPlaceholder = computed(() => !props.modelValue && props.modelValue !== 0);

// Al abrir, hace scroll al item seleccionado
const scrollToSelected = async () => {
  await nextTick(); // espera a que el DOM esté montado
  const ul = psRef.value?.$el ?? psRef.value;
  if (!ul) return;

  const selected = ul.querySelector('[data-selected="true"]');
  if (!selected) return;

  // Centra el item en el contenedor
  ul.scrollTop = selected.offsetTop - ul.clientHeight / 2 + selected.clientHeight / 2;

  // Notifica a PerfectScrollbar del nuevo scrollTop
  psRef.value?.updateScrollbar?.();
};

const toggle = async () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollToSelected();
};

const select = (value) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const handleOutsideClick = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) isOpen.value = false;
};

onMounted(() => document.addEventListener('mousedown', handleOutsideClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick));
</script>

<template>
  <div ref="containerRef" class="relative" :class="width">
    <!-- Trigger -->
    <button
      type="button"
      @click="toggle"
      :disabled="disabled"
      :class="[
        'flex h-10 w-full items-center justify-between gap-2 rounded border px-3 text-sm transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
          : 'cursor-pointer border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-brand-500',
        isOpen
          ? 'border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-500 dark:ring-brand-500/20'
          : '',
        error ? 'select-trigger--error' : ''
      ]"
    >
      <span
        :class="isPlaceholder ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-200'"
      >
        {{ selectedLabel }}
      </span>
      <ChevronDown
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 dark:text-slate-500"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-1.5 min-w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
      >
        <PerfectScrollbar
          ref="psRef"
          tag="ul"
          style="max-height: 224px"
          :options="{ suppressScrollX: true, wheelPropagation: false }"
        >
          <li
            v-for="opt in options"
            :key="opt.value"
            :data-selected="String(modelValue) === String(opt.value) ? 'true' : 'false'"
            @click="select(opt.value)"
            class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors"
            :class="
              String(modelValue) === String(opt.value)
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
            "
          >
            <span>{{ opt.label }}</span>
            <Check
              v-if="String(modelValue) === String(opt.value)"
              class="h-3.5 w-3.5 shrink-0 text-brand-500"
            />
          </li>
        </PerfectScrollbar>
      </div>
    </Transition>
  </div>
</template>
