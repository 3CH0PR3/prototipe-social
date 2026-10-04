<script setup>
import { ref, computed, watch } from 'vue';
import { BrushCleaning } from '@lucide/vue';
import CustomSelect from '@shared/components/form/CustomSelect.vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  showDateFilters: { type: Boolean, default: true },
  showApsFilters: { type: Boolean, default: false },
  apsList: { type: Array, default: () => [] },
  defaultCurrentDate: { type: Boolean, default: false },
  defaultCurrentAps: { type: String, default: '' },
  perPage: { type: Number, default: 10 }
});

const emit = defineEmits(['filter-change']);

const currentYearStr = String(new Date().getFullYear());
const currentMonthStr = String(new Date().getMonth() + 1);

const selectedYear = ref(props.defaultCurrentDate ? currentYearStr : '');
const selectedMonth = ref(props.defaultCurrentDate ? currentMonthStr : '');
const selectedAps = ref(props.defaultCurrentAps);
const selectedPerPage = ref(props.perPage);

watch(
  () => props.perPage,
  (val) => {
    selectedPerPage.value = val;
  }
);

const MIN_YEAR = 2016;
const MIN_MONTH = 4;

const perPageOptions = [
  { value: 10, label: '10 filas' },
  { value: 15, label: '15 filas' },
  { value: 25, label: '25 filas' },
  { value: 50, label: '50 filas' },
  { value: 1000, label: 'Todos' }
];

const ALL_MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

const yearOptions = computed(() => {
  const cur = new Date().getFullYear();
  const years = [];
  for (let y = cur; y >= MIN_YEAR; y--) years.push({ value: String(y), label: String(y) });
  return props.defaultCurrentDate ? years : [{ value: '', label: 'Año' }, ...years];
});

const monthOptions = computed(() => {
  const cur = new Date().getFullYear();
  const curMonth = new Date().getMonth() + 1;
  const year = Number(selectedYear.value);
  let months = ALL_MONTHS;
  if (year === MIN_YEAR) months = months.filter((m) => Number(m.value) >= MIN_MONTH);
  if (!year || year === cur) months = months.filter((m) => Number(m.value) <= curMonth);
  if (selectedMonth.value && !months.find((m) => m.value === selectedMonth.value)) {
    selectedMonth.value = props.defaultCurrentDate ? String(months[months.length - 1].value) : '';
  }
  return props.defaultCurrentDate ? months : [{ value: '', label: 'Mes' }, ...months];
});

const apsOptions = computed(() => {
  const options = props.apsList.map((aps) => ({
    value: aps.nuap,
    label: `${aps.nuap} - ${aps.name}`
  }));
  return [{ value: '', label: 'NUAP' }, ...options];
});

const clearFilters = () => {
  selectedYear.value = props.defaultCurrentDate ? currentYearStr : '';
  selectedMonth.value = props.defaultCurrentDate ? currentMonthStr : '';
  selectedAps.value = props.defaultCurrentAps;
};

const hasActive = computed(() => {
  if (props.defaultCurrentDate) {
    return (
      selectedYear.value !== currentYearStr ||
      selectedMonth.value !== currentMonthStr ||
      selectedAps.value !== props.defaultCurrentAps
    );
  }
  return selectedYear.value || selectedMonth.value || selectedAps.value;
});

watch([selectedYear, selectedMonth, selectedAps, selectedPerPage], () => {
  emit('filter-change', {
    year: selectedYear.value,
    month: selectedMonth.value,
    nuap: selectedAps.value,
    perPage: selectedPerPage.value
  });
});
</script>

<template>
  <div class="flex items-center gap-2">
    <CustomSelect
      v-model="selectedPerPage"
      :options="perPageOptions"
      :disabled="loading"
      width="w-full md:w-28"
    />
    <template v-if="showDateFilters || showApsFilters">
      <CustomSelect
        v-if="showDateFilters"
        v-model="selectedYear"
        :options="yearOptions"
        :disabled="loading"
        width="w-full md:w-28"
      />
      <CustomSelect
        v-if="showDateFilters"
        v-model="selectedMonth"
        :options="monthOptions"
        :disabled="loading"
        width="w-full md:w-36"
      />
      <CustomSelect
        v-if="showApsFilters"
        v-model="selectedAps"
        :options="apsOptions"
        :disabled="loading"
        width="w-full md:w-64"
      />
      <button v-if="hasActive" class="filter-clear-btn" @click="clearFilters">
        <BrushCleaning :size="16" />
      </button>
    </template>
    <slot name="extra-filters" />
  </div>
</template>
