<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays, X } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'DD-MM-AAAA' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disableFutureDates: { type: Boolean, default: true },
  disablePastDates: { type: Boolean, default: false },
  minDate: { type: String, default: '1900-01-01' },
  minAge: { type: Number, default: null },
  optional: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  hint: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'ageError']);

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
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const today = new Date();
today.setHours(0, 0, 0, 0);

const isOpen = ref(false);
const wrapRef = ref(null);
const openUpward = ref(false);
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

const editingYear = ref(false);
const yearInputVal = ref('');
const yearInputRef = ref(null);

const parse = (str) => {
  if (!str) return null;
  const [d, m, y] = str.split('-').map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const format = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}-${m}-${date.getFullYear()}`;
};

const parseISO = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const selectedDate = computed(() => parse(props.modelValue));
const displayValue = computed(() => props.modelValue || '');
const minDateParsed = computed(() => {
  const parsed = parseISO(props.minDate);
  if (props.disablePastDates) {
    return parsed && parsed > today ? parsed : today;
  }
  return parsed;
});

const maxDate = computed(() => {
  if (props.minAge) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - props.minAge);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return props.disableFutureDates ? today : null;
});

const calendarDays = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
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
});

const canGoNext = computed(() => {
  if (!props.disableFutureDates && !maxDate.value) return true;
  const limit = maxDate.value ?? today;
  return new Date(viewYear.value, viewMonth.value + 1, 1) <= limit;
});

const canGoPrev = computed(() => {
  if (!minDateParsed.value) return true;
  const lastDayOfPrevMonth = new Date(viewYear.value, viewMonth.value, 0, 23, 59, 59);
  return lastDayOfPrevMonth >= minDateParsed.value;
});

const isSelected = (date) => selectedDate.value?.toDateString() === date.toDateString();
const isToday = (date) => today.toDateString() === date.toDateString();
const isDisabled = (date) => {
  if (maxDate.value && date > maxDate.value) return true;
  if (minDateParsed.value && date < minDateParsed.value) return true;
  return false;
};

const prevMonth = () => {
  if (!canGoPrev.value) return;
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else viewMonth.value--;
};

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else viewMonth.value++;
};

const onMonthSelect = (e) => {
  viewMonth.value = Number(e.target.value);
};

const startEditYear = () => {
  yearInputVal.value = String(viewYear.value);
  editingYear.value = true;
  nextTick(() => yearInputRef.value?.select());
};

const confirmYear = () => {
  const y = parseInt(yearInputVal.value, 10);
  if (!isNaN(y) && y >= 1 && y <= 9999) viewYear.value = y;
  editingYear.value = false;
};

const onYearKeydown = (e) => {
  if (e.key === 'Enter') confirmYear();
  if (e.key === 'Escape') editingYear.value = false;
};

const selectDay = (day) => {
  if (isDisabled(day.date)) return;

  if (props.minAge) {
    const age =
      today.getFullYear() -
      day.date.getFullYear() -
      (today < new Date(today.getFullYear(), day.date.getMonth(), day.date.getDate()) ? 1 : 0);
    if (age < props.minAge) {
      emit('ageError', `Debe ser mayor de ${props.minAge} años`);
      return;
    }
  }

  emit('update:modelValue', format(day.date));
  emit('ageError', null);
  isOpen.value = false;
};

const clear = (e) => {
  e?.stopPropagation();
  emit('update:modelValue', '');
};

const open = () => {
  if (props.disabled) return;
  const d = selectedDate.value ?? today;
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();

  const rect = wrapRef.value?.getBoundingClientRect();
  openUpward.value = window.innerHeight - (rect?.bottom ?? 0) < 300;
  isOpen.value = true;
};

const toggle = () => (isOpen.value ? (isOpen.value = false) : open());

const onOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) isOpen.value = false;
};

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));

watch(
  () => props.modelValue,
  (val) => {
    const d = parse(val);
    if (d) {
      viewYear.value = d.getFullYear();
      viewMonth.value = d.getMonth();
    }
  }
);
</script>

<template>
  <div ref="wrapRef" class="relative w-full">
    <div
      class="input-field flex cursor-pointer items-center justify-between gap-2 !py-0"
      :class="[
        error ? 'input-field--error' : '',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        isOpen ? '!border-brand-500 !ring-2 !ring-brand-500/20' : ''
      ]"
      style="height: 2.5rem"
      role="combobox"
      tabindex="0"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      @keydown.tab="isOpen = false"
      @keydown.escape="isOpen = false"
    >
      <span
        class="flex-1 truncate text-sm"
        :class="displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-400'"
      >
        {{ displayValue || (optional ? placeholder + ' (opcional)' : placeholder) }}
      </span>
      <span class="flex shrink-0 items-center gap-1">
        <button
          v-if="clearable && displayValue && !disabled"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          @click.stop="clear"
        >
          <X class="h-3.5 w-3.5" />
        </button>
        <CalendarDays class="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </span>
    </div>

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
        class="absolute left-0 z-50 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
        :class="openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'"
      >
        <div class="mb-3 flex items-center justify-between gap-1">
          <button
            type="button"
            :disabled="!canGoPrev"
            class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            @click="prevMonth"
          >
            <ChevronLeft class="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>

          <div class="flex items-center gap-1.5">
            <select
              :value="viewMonth"
              class="cursor-pointer rounded border-0 bg-transparent py-0.5 px-1 text-sm font-medium text-slate-900 outline-none hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              @change="onMonthSelect"
            >
              <option v-for="(m, i) in MONTHS" :key="i" :value="i" class="bg-white dark:bg-slate-900">
                {{ m }}
              </option>
            </select>

            <input
              v-if="editingYear"
              ref="yearInputRef"
              v-model="yearInputVal"
              type="text"
              maxlength="4"
              class="w-12 bg-transparent text-center text-sm font-semibold text-slate-900 outline-none border-none focus:ring-0 focus:outline-none dark:text-white p-0 m-0"
              @blur="confirmYear"
              @keydown="onYearKeydown"
            />
            <button
              v-else
              type="button"
              class="rounded px-1 py-0.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              @click="startEditYear"
            >
              {{ viewYear }}
            </button>
          </div>

          <button
            type="button"
            :disabled="!canGoNext"
            class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            @click="nextMonth"
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
            v-for="(day, i) in calendarDays"
            :key="i"
            type="button"
            :disabled="isDisabled(day.date)"
            class="flex h-8 w-full items-center justify-center rounded text-xs transition"
            :class="[
              day.outside ? 'text-slate-300 dark:text-slate-600' : '',
              !day.outside && !isSelected(day.date) && !isDisabled(day.date)
                ? 'text-slate-700 hover:bg-brand-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-400'
                : '',
              isSelected(day.date) ? '!bg-brand-500 !text-white font-semibold' : '',
              isToday(day.date) && !isSelected(day.date)
                ? 'font-semibold text-brand-500 ring-1 ring-brand-500/40 dark:text-brand-400'
                : '',
              isDisabled(day.date) ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
            ]"
            @click="selectDay(day)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>
    </Transition>

    <p v-if="hint">{{ hint }}</p>
  </div>
</template>
