<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCompaniesStore } from '../stores/useCompanies.store';
import { Building2, ArrowRight } from '@lucide/vue';
import CompanyApplicationModal from '../components/CompanyApplicationModal.vue';
import SearchableSelect from '@shared/components/form/SearchableSelect.vue';
import FormField from '@shared/components/form/FormField.vue';

import { useForm } from '@shared/composables/useForm';

const store = useCompaniesStore();

const departments = ref([]);
const municipalities = ref([]);

const form = useForm({
  department: '',
  municipality: ''
});

const selectedCompany = ref(null);
const isModalOpen = ref(false);

// Use the existing central api config or direct url
const fetchDepartments = async () => {
  try {
    const deps = await store.getDepartments();

    departments.value = deps.map((d) => ({
      value: String(d.code),
      label: d.name
    }));
  } catch (error) {
    console.error(error);
  }
};

const fetchMunicipalities = async (depId) => {
  try {
    const muns = await store.getMunicipalities(depId);
    municipalities.value = muns.map((m) => ({
      value: String(m.code),
      label: m.name
    }));
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchDepartments();
});

watch(
  () => form.department,
  (newVal) => {
    form.municipality = '';
    municipalities.value = [];
    store.items = []; // clear search
    if (newVal) {
      fetchMunicipalities(newVal);
    }
  }
);

watch(
  () => form.municipality,
  (newVal) => {
    if (newVal) {
      store.searchCompanies(newVal);
    } else {
      store.items = [];
    }
  }
);

const openApplyModal = (company) => {
  selectedCompany.value = company;
  isModalOpen.value = true;
};

const handleApply = async (formData) => {
  if (!selectedCompany.value) return;
  await store.applyToCompany(selectedCompany.value.id, formData);
  isModalOpen.value = false;
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-4">
      <h1 class="text-xs md:text-lg font-medium text-gray-900 dark:text-white">Explorar Empresas</h1>
      <p class="text-xs md:text-md text-gray-600 dark:text-gray-400">
        Encuentra y aplica a empresas en tu municipio para unirte a su base de datos.
      </p>
    </div>

    <!-- Filters -->
    <div class="soc-card p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Departamento" required>
          <SearchableSelect
            v-model="form.department"
            :options="departments"
            placeholder="Seleccione departamento..."
          />
        </FormField>
        <FormField label="Municipio" required>
          <SearchableSelect
            v-model="form.municipality"
            :options="municipalities"
            :disabled="!form.department"
            placeholder="Seleccione municipio..."
          />
        </FormField>
      </div>
    </div>

    <!-- Results -->
    <div v-if="store.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>

    <div
      v-else-if="form.municipality && store.items.length === 0"
      class="text-center py-12 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-white/10"
    >
      <Building2 class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No se encontraron empresas</h3>
      <p class="text-gray-500 dark:text-gray-400">
        No hay empresas registradas en este municipio actualmente.
      </p>
    </div>

    <div v-else-if="store.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="company in store.items"
        :key="company.id"
        class="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-6 flex flex-col"
      >
        <div class="flex items-start gap-4 mb-4">
          <div
            class="w-12 h-12 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0"
          >
            <img
              v-if="company.logo"
              :src="company.logo"
              :alt="company.company"
              class="w-10 h-10 object-contain"
            />
            <Building2 v-else class="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {{ company.company }}
            </h3>
            <p v-if="company.sigla" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ company.sigla }}
            </p>
          </div>
        </div>

        <div
          class="mt-auto pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between"
        >
          <button
            @click="openApplyModal(company)"
            class="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            Aplicar a esta empresa
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">
        Selecciona un departamento y municipio para buscar empresas.
      </p>
    </div>

    <CompanyApplicationModal v-model:isOpen="isModalOpen" :company="selectedCompany" @apply="handleApply" />
  </div>
</template>
