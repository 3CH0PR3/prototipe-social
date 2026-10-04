<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronLeft, ChevronRight, CalendarDays, X } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: String, default: '' }, // formato YYYY-MM
  placeholder: { type: String, default: 'MM-YYYY' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  minDate: { type: String, default: '2016-04' }
});

const emit = defineEmits(['update:modelValue']);

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const today = new Date();
const isOpen = ref(false);
const wrapRef = ref(null);
const viewYear = ref(today.getFullYear());

const selectedYear = computed(() => (props.modelValue ? Number(props.modelValue.split('-')[0]) : null));
const selectedMonth = computed(() => (props.modelValue ? Number(props.modelValue.split('-')[1]) - 1 : null));

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const [y, m] = props.modelValue.split('-');
  return `${m}-${y}`;
});

const minYear = computed(() => Number(props.minDate.split('-')[0]));
const minMonth = computed(() => Number(props.minDate.split('-')[1]) - 1);
const maxYear = today.getFullYear();
const maxMonth = today.getMonth();

const isDisabled = (monthIndex) => {
  if (viewYear.value < minYear.value) return true;
  if (viewYear.value === minYear.value && monthIndex < minMonth.value) return true;
  if (viewYear.value > maxYear) return true;
  if (viewYear.value === maxYear && monthIndex > maxMonth) return true;
  return false;
};

const isSelected = (monthIndex) =>
  selectedYear.value === viewYear.value && selectedMonth.value === monthIndex;

const prevYear = () => {
  if (viewYear.value > minYear.value) viewYear.value--;
};
const nextYear = () => {
  if (viewYear.value < maxYear) viewYear.value++;
};

const canPrev = computed(() => viewYear.value > minYear.value);
const canNext = computed(() => viewYear.value < maxYear);

const selectMonth = (monthIndex) => {
  if (isDisabled(monthIndex)) return;
  const m = String(monthIndex + 1).padStart(2, '0');
  emit('update:modelValue', `${viewYear.value}-${m}`);
  isOpen.value = false;
};

const clear = (e) => {
  e?.stopPropagation();
  emit('update:modelValue', '');
};

const toggle = () => {
  if (props.disabled) return;
  if (!isOpen.value && props.modelValue) {
    viewYear.value = Number(props.modelValue.split('-')[0]);
  }
  isOpen.value = !isOpen.value;
};

const onOutside = (e) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) isOpen.value = false;
};

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
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
      @click="toggle"
    >
      <span
        class="flex-1 truncate text-sm"
        :class="displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'"
      >
        {{ displayValue || placeholder }}
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
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
      >
        <div class="mb-3 flex items-center justify-between">
          <button
            type="button"
            :disabled="!canPrev"
            class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            @click="prevYear"
          >
            <ChevronLeft class="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>
          <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ viewYear }}</span>
          <button
            type="button"
            :disabled="!canNext"
            class="rounded p-1.5 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            @click="nextYear"
          >
            <ChevronRight class="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="(month, i) in MONTHS_SHORT"
            :key="i"
            type="button"
            :disabled="isDisabled(i)"
            class="rounded-md py-2 text-xs font-medium transition"
            :class="[
              isSelected(i)
                ? 'bg-brand-500 text-white'
                : isDisabled(i)
                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                  : 'text-slate-700 hover:bg-brand-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-400'
            ]"
            @click="selectMonth(i)"
          >
            {{ month }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
