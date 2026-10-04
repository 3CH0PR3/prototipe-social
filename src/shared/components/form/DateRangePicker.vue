<script setup>
/**
 * DateRangePicker — selector de rango de fechas nativo sin librerías.
 *
 * modelValue / emits: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 * Compatible con la API del DateRangePicker anterior (flatpickr).
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays, X, ArrowRight } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ start: '', end: '' }) },
  placeholder: { type: String, default: 'Seleccionar rango' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disableFutureDates: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

// ── Estado ────────────────────────────────────────────────────────────────────
const isOpen = ref(false);
const wrapRef = ref(null);
const openUpward = ref(false);
const hoverDate = ref(null);
const selecting = ref(null); // Date del primer clic (eligiendo end)

const today = new Date();
today.setHours(0, 0, 0, 0);

const leftYear = ref(today.getFullYear());
const leftMonth = ref(0);
const rightYear = ref(today.getFullYear());
const rightMonth = ref(0);

const syncMonths = () => {
  const d = new Date();
  rightMonth.value = d.getMonth();
  rightYear.value = d.getFullYear();
  if (d.getMonth() === 0) {
    leftMonth.value = 11;
    leftYear.value = d.getFullYear() - 1;
  } else {
    leftMonth.value = d.getMonth() - 1;
    leftYear.value = d.getFullYear();
  }
};

// ── Parseo / formateo ─────────────────────────────────────────────────────────

const parseISO = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const toISO = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};

const toDisplay = (str) => {
  const d = parseISO(str);
  if (!d) return '';
  return d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// ── Computed ──────────────────────────────────────────────────────────────────

const startDate = computed(() => parseISO(props.modelValue?.start));
const endDate = computed(() => parseISO(props.modelValue?.end));
const hasValue = computed(() => !!(props.modelValue?.start || props.modelValue?.end));

const displayText = computed(() => {
  const s = toDisplay(props.modelValue?.start);
  const e = toDisplay(props.modelValue?.end);
  if (s && e) return `${s} — ${e}`;
  if (s) return `${s} — ...`;
  return '';
});

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];
const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

// ── Generar días de un mes ────────────────────────────────────────────────────

const buildDays = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const days = [];

  for (let i = startDow - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), outside: true });

  for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(year, month, d), outside: false });

  while (days.length % 7 !== 0)
    days.push({
      date: new Date(year, month + 1, days.length - last.getDate() - startDow + 1),
      outside: true
    });

  return days;
};

const leftDays = computed(() => buildDays(leftYear.value, leftMonth.value));
const rightDays = computed(() => buildDays(rightYear.value, rightMonth.value));

// ── Estado visual efectivo (con hover preview) ────────────────────────────────

const effectiveStart = computed(() => {
  if (selecting.value && hoverDate.value)
    return selecting.value <= hoverDate.value ? selecting.value : hoverDate.value;
  return startDate.value;
});

const effectiveEnd = computed(() => {
  if (selecting.value && hoverDate.value)
    return selecting.value <= hoverDate.value ? hoverDate.value : selecting.value;
  return endDate.value;
});

// ── Clases por día ────────────────────────────────────────────────────────────

const getDayClass = (day) => {
  const date = day.date;
  const sel = String(date.toDateString());

  const isStart = effectiveStart.value?.toDateString() === sel;
  const isEnd = effectiveEnd.value?.toDateString() === sel;
  const inRange =
    effectiveStart.value && effectiveEnd.value && date > effectiveStart.value && date < effectiveEnd.value;
  const isTodayDay = date.toDateString() === today.toDateString();
  const disabled = isDisabledDay(date);

  if (day.outside) return 'text-slate-300 dark:text-slate-700 pointer-events-none';

  if (disabled) return 'cursor-not-allowed text-slate-300 dark:text-slate-600';

  if (isStart && isEnd) return 'bg-brand-500 text-white font-semibold rounded';

  if (isStart) return 'bg-brand-500 text-white font-semibold rounded-l-full';

  if (isEnd) return 'bg-brand-500 text-white font-semibold rounded-r-full';

  if (inRange) return 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400';

  const base = isTodayDay
    ? 'font-bold text-brand-500 ring-1 ring-brand-500/40 rounded dark:text-brand-400'
    : 'text-slate-700 dark:text-slate-300';

  return `${base} hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 rounded cursor-pointer`;
};

const isDisabledDay = (date) => {
  if (props.disableFutureDates && date > today) return true;
  if (selecting.value && date < selecting.value) return true;
  return false;
};

// ── Navegación ────────────────────────────────────────────────────────────────

const prevLeft = () => {
  if (leftMonth.value === 0) {
    leftMonth.value = 11;
    leftYear.value--;
  } else leftMonth.value--;
  // Empujar derecho si colisiona
  if (
    rightYear.value < leftYear.value ||
    (rightYear.value === leftYear.value && rightMonth.value <= leftMonth.value)
  ) {
    rightMonth.value = (leftMonth.value + 1) % 12;
    rightYear.value = leftMonth.value === 11 ? leftYear.value + 1 : leftYear.value;
  }
};

const canGoNextRight = computed(() => {
  if (!props.disableFutureDates) return true;
  const next = new Date(rightYear.value, rightMonth.value + 1, 1);
  return next <= today;
});

const nextRight = () => {
  if (!canGoNextRight.value) return;
  if (rightMonth.value === 11) {
    rightMonth.value = 0;
    rightYear.value++;
  } else rightMonth.value++;
  // Empujar izquierdo si colisiona
  if (
    leftYear.value > rightYear.value ||
    (leftYear.value === rightYear.value && leftMonth.value >= rightMonth.value)
  ) {
    leftMonth.value = (rightMonth.value - 1 + 12) % 12;
    leftYear.value = rightMonth.value === 0 ? rightYear.value - 1 : rightYear.value;
  }
};

// ── Selección ─────────────────────────────────────────────────────────────────

const clickDay = (day) => {
  if (isDisabledDay(day.date) || day.outside) return;

  if (!selecting.value) {
    selecting.value = day.date;
    hoverDate.value = null;
    emit('update:modelValue', { start: '', end: '' });
  } else {
    let s = selecting.value;
    let e = day.date;
    if (e < s) [s, e] = [e, s];
    emit('update:modelValue', { start: toISO(s), end: toISO(e) });
    selecting.value = null;
    hoverDate.value = null;
    isOpen.value = false;
  }
};

const onHover = (day) => {
  if (selecting.value && !day.outside && !isDisabledDay(day.date)) hoverDate.value = day.date;
};

const clear = (e) => {
  e?.stopPropagation();
  selecting.value = null;
  hoverDate.value = null;
  emit('update:modelValue', { start: '', end: '' });
};

// ── Abrir / cerrar ────────────────────────────────────────────────────────────

const open = () => {
  if (props.disabled) return;
  syncMonths();
  selecting.value = null;
  hoverDate.value = null;
  const rect = wrapRef.value?.getBoundingClientRect();
  openUpward.value = window.innerHeight - (rect?.bottom ?? 0) < 340;
  isOpen.value = true;
};

const toggle = () => (isOpen.value ? (isOpen.value = false) : open());

const onOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    isOpen.value = false;
    selecting.value = null;
    hoverDate.value = null;
  }
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
        :class="hasValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'"
      >
        {{ hasValue ? displayText : placeholder }}
      </span>
      <span class="flex shrink-0 items-center gap-1">
        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          @click.stop="clear"
        >
          <X class="h-3.5 w-3.5" />
        </button>
        <CalendarDays class="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </span>
    </div>

    <!-- Calendarios dobles ───────────────────────────────────────────────────── -->
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
        class="absolute left-0 z-50 mt-2 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700/60 dark:bg-slate-900 sm:flex-row"
        :class="openUpward ? 'bottom-full mb-2' : 'top-full mt-2'"
      >
        <!-- Instrucción -->
        <p class="absolute -top-6 left-0 text-xs text-slate-400 dark:text-slate-500">
          {{ selecting ? 'Ahora selecciona la fecha final' : 'Selecciona la fecha de inicio' }}
        </p>

        <!-- ── Mes izquierdo ──────────────────────────────────────────────────── -->
        <div class="w-full sm:w-64">
          <div class="mb-3 flex items-center justify-between">
            <button
              type="button"
              class="rounded p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              @click="prevLeft"
            >
              <ChevronLeft class="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ MONTHS[leftMonth] }} {{ leftYear }}
            </span>
            <span class="w-7" />
          </div>

          <div class="mb-1 grid grid-cols-7">
            <span
              v-for="d in DAYS"
              :key="d"
              class="text-center text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500"
            >
              {{ d }}
            </span>
          </div>

          <div class="grid grid-cols-7 gap-y-0.5">
            <button
              v-for="(day, i) in leftDays"
              :key="i"
              type="button"
              :disabled="isDisabledDay(day.date) || day.outside"
              class="flex h-8 w-full items-center justify-center text-xs transition"
              :class="getDayClass(day)"
              @click="clickDay(day)"
              @mouseenter="onHover(day)"
            >
              {{ day.date.getDate() }}
            </button>
          </div>
        </div>

        <!-- Separador -->
        <div class="flex items-center justify-center">
          <ArrowRight class="h-4 w-4 rotate-90 text-slate-300 dark:text-slate-600 sm:rotate-0" />
        </div>

        <!-- ── Mes derecho ─────────────────────────────────────────────────────── -->
        <div class="w-full sm:w-64">
          <div class="mb-3 flex items-center justify-between">
            <span class="w-7" />
            <span class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ MONTHS[rightMonth] }} {{ rightYear }}
            </span>
            <button
              type="button"
              :disabled="!canGoNextRight"
              class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
              @click="nextRight"
            >
              <ChevronRight class="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div class="mb-1 grid grid-cols-7">
            <span
              v-for="d in DAYS"
              :key="d"
              class="text-center text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500"
            >
              {{ d }}
            </span>
          </div>

          <div class="grid grid-cols-7 gap-y-0.5">
            <button
              v-for="(day, i) in rightDays"
              :key="i"
              type="button"
              :disabled="isDisabledDay(day.date) || day.outside"
              class="flex h-8 w-full items-center justify-center text-xs transition"
              :class="getDayClass(day)"
              @click="clickDay(day)"
              @mouseenter="onHover(day)"
            >
              {{ day.date.getDate() }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
