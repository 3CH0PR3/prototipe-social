<script setup>
/**
 * MonthPicker — selector de mes/año nativo sin librerías externas.
 *
 * modelValue / emits: string en formato "MM-YYYY"
 * Compatible con la API del MonthPicker anterior (Bootstrap + jQuery).
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays, X } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'MM-AAAA' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disableFutureDates: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const wrapRef = ref(null);
const openUpward = ref(false);

const today = new Date();
const realYear = today.getFullYear();
const realMonth = today.getMonth() + 1; // 1-12

const viewYear = ref(realYear);

// ── Parsed ───────────────────────────────────────────────────────────────────

const selectedMM = computed(() => {
  const [mm] = (props.modelValue || '').split('-');
  return mm ? parseInt(mm) : null;
});

const selectedYY = computed(() => {
  const [, yy] = (props.modelValue || '').split('-');
  return yy ? parseInt(yy) : null;
});

// ── Meses ─────────────────────────────────────────────────────────────────────

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const isActive = (idx) => {
  const mm = idx + 1;
  return selectedMM.value === mm && selectedYY.value === viewYear.value;
};

const isDisabled = (idx) => {
  if (!props.disableFutureDates) return false;
  const mm = idx + 1;
  if (viewYear.value > realYear) return true;
  if (viewYear.value === realYear && mm > realMonth) return true;
  return false;
};

// ── Navegación año ────────────────────────────────────────────────────────────

const canGoNext = computed(() => !props.disableFutureDates || viewYear.value < realYear);

const prevYear = () => viewYear.value--;
const nextYear = () => {
  if (canGoNext.value) viewYear.value++;
};

// ── Selección ─────────────────────────────────────────────────────────────────

const selectMonth = (idx) => {
  if (isDisabled(idx)) return;
  const mm = String(idx + 1).padStart(2, '0');
  emit('update:modelValue', `${mm}-${viewYear.value}`);
  isOpen.value = false;
};

const clear = (e) => {
  e?.stopPropagation();
  emit('update:modelValue', '');
};

// ── Abrir / cerrar ────────────────────────────────────────────────────────────

const open = () => {
  if (props.disabled) return;
  viewYear.value = selectedYY.value ?? realYear;
  const rect = wrapRef.value?.getBoundingClientRect();
  openUpward.value = window.innerHeight - (rect?.bottom ?? 0) < 260;
  isOpen.value = true;
};

const toggle = () => (isOpen.value ? (isOpen.value = false) : open());

const onOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) isOpen.value = false;
};

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
</script>

<template>
  <div ref="wrapRef" class="relative w-full">
    <!-- Trigger ──────────────────────────────────────────────────────────────── -->
    <div
      class="input-field flex cursor-pointer items-center justify-between gap-2 !py-0"
      style="height: 2.5rem"
      :class="[
        error ? 'input-field--error' : '',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        isOpen ? '!border-brand-500 !ring-2 !ring-brand-500/20' : ''
      ]"
      @click="toggle"
    >
      <span
        class="flex-1 truncate text-sm"
        :class="modelValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'"
      >
        {{ modelValue || placeholder }}
      </span>
      <span class="flex shrink-0 items-center gap-1">
        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          @click.stop="clear"
        >
          <X class="h-3.5 w-3.5" />
        </button>
        <CalendarDays class="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </span>
    </div>

    <!-- Popup ───────────────────────────────────────────────────────────────── -->
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
        class="absolute left-0 z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
        :class="openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'"
      >
        <!-- Navegación año -->
        <div class="mb-3 flex items-center justify-between">
          <button
            type="button"
            class="rounded p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="prevYear"
          >
            <ChevronLeft class="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>

          <span class="text-sm font-semibold text-slate-900 dark:text-white">
            {{ viewYear }}
          </span>

          <button
            type="button"
            :disabled="!canGoNext"
            class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            @click="nextYear"
          >
            <ChevronRight class="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <!-- Grid de meses 3×4 -->
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="(m, i) in MONTHS"
            :key="i"
            type="button"
            :disabled="isDisabled(i)"
            class="rounded px-2 py-2 text-xs font-medium transition"
            :class="[
              isActive(i)
                ? 'bg-brand-500 text-white shadow-sm'
                : isDisabled(i)
                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                  : 'text-slate-700 hover:bg-brand-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-400'
            ]"
            @click="selectMonth(i)"
          >
            {{ m }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
