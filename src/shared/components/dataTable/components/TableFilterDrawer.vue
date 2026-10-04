<script setup>
import { ref, computed, watch } from 'vue';
import { X, SlidersHorizontal, BrushCleaning } from '@lucide/vue';
import CustomSelect from '@shared/components/form/CustomSelect.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  showDateFilters: { type: Boolean, default: true },
  showLocationFilters: { type: Boolean, default: false },
  departments: { type: Array, default: () => [] },
  municipalities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'filter-change']);

const selectedYear = ref('');
const selectedMonth = ref('');
const selectedDepartment = ref('');
const selectedMunicipality = ref('');

const MIN_YEAR = 2016;
const MIN_MONTH = 4;

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
  return [{ value: '', label: 'Año' }, ...years];
});

const monthOptions = computed(() => {
  const cur = new Date().getFullYear();
  const curMonth = new Date().getMonth() + 1;
  const year = Number(selectedYear.value);
  let months = ALL_MONTHS;
  if (year === MIN_YEAR) months = months.filter((m) => Number(m.value) >= MIN_MONTH);
  if (year === cur) months = months.filter((m) => Number(m.value) <= curMonth);
  if (selectedMonth.value && !months.find((m) => m.value === selectedMonth.value)) selectedMonth.value = '';
  return [{ value: '', label: 'Mes' }, ...months];
});

const departmentOptions = computed(() => [
  { value: '', label: 'Departamento' },
  ...props.departments.map((d) => ({ value: d.id, label: d.name }))
]);

const municipalityOptions = computed(() => {
  const list = selectedDepartment.value
    ? props.municipalities.filter((m) => m.department_id === selectedDepartment.value)
    : props.municipalities;
  return [{ value: '', label: 'Municipio' }, ...list.map((m) => ({ value: m.id, label: m.name }))];
});

watch(selectedDepartment, () => {
  selectedMunicipality.value = '';
});
watch([selectedYear, selectedMonth, selectedDepartment, selectedMunicipality], emitFilters);

function emitFilters() {
  emit('filter-change', {
    year: selectedYear.value,
    month: selectedMonth.value,
    department: selectedDepartment.value,
    municipality: selectedMunicipality.value
  });
}

const hasActive = computed(
  () => selectedYear.value || selectedMonth.value || selectedDepartment.value || selectedMunicipality.value
);

const clearAll = () => {
  selectedYear.value = selectedMonth.value = selectedDepartment.value = selectedMunicipality.value = '';
};
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" @click="emit('close')" />
  </Transition>

  <!-- Drawer -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="show"
      class="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-xl dark:bg-slate-900"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"
      >
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="h-4 w-4 text-brand-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Filtros avanzados</h3>
        </div>
        <button
          class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <!-- Fecha -->
        <div v-if="showDateFilters" class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Período
          </p>
          <CustomSelect v-model="selectedYear" :options="yearOptions" :disabled="loading" width="w-full" />
          <CustomSelect v-model="selectedMonth" :options="monthOptions" :disabled="loading" width="w-full" />
        </div>

        <!-- Ubicación -->
        <div v-if="showLocationFilters" class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Ubicación
          </p>
          <CustomSelect
            v-model="selectedDepartment"
            :options="departmentOptions"
            :disabled="loading"
            width="w-full"
          />
          <CustomSelect
            v-model="selectedMunicipality"
            :options="municipalityOptions"
            :disabled="loading || !selectedDepartment"
            width="w-full"
          />
        </div>

        <!-- Slot para filtros extra por tabla -->
        <slot name="extra-filters" />
      </div>

      <!-- Footer -->
      <div class="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <button
          v-if="hasActive"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="clearAll"
        >
          <BrushCleaning class="h-4 w-4" />
          Limpiar filtros
        </button>
      </div>
    </div>
  </Transition>
</template>
