import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from '@shared/composables/useToast';
import { CompaniesService } from '../services/companies.service.js';

export const useCompaniesStore = defineStore('social.companies', () => {
  const toast = useToast();

  const items = ref([]);
  const filters = ref({ search: '' });
  const errorMsg = ref(null);
  const isFetched = ref(false);
  const isLoading = ref(false);

  // Infinite Scroll state
  const hasMore = ref(true);
  const nextCursor = ref(null);

  let fetchPromise = null;

  const setLoading = (v) => (isLoading.value = v);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  const executeAsync = async (fn) => {
    clearError();
    setLoading(true);
    try {
      return await fn();
    } catch (err) {
      setErrors(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (daneCode) => executeAsync(async () => {
    const resp = await CompaniesService.search({ dane_code: daneCode });
    items.value = resp.data?.data ?? [];
    isFetched.value = true;
    return items.value;
  });

  const applyToCompany = async (tenantId, data) => executeAsync(async () => {
    const resp = await CompaniesService.apply(tenantId, data);
    toast.success(resp.data?.message ?? ' enviada exitosamente');
    return resp.data;
  });

  const getDepartments = async () => executeAsync(async () => {
    const resp = await CompaniesService.getDepartments();
    return resp.data?.departments ?? [];
  });

  const getMunicipalities = async (departmentCode) => executeAsync(async () => {
    const resp = await CompaniesService.getMunicipalities(departmentCode);
    return resp.data?.municipalities ?? [];
  });

  return {
    items,
    filters,
    errorMsg,
    isFetched,
    isLoading,

    searchCompanies,
    applyToCompany,
    getDepartments,
    getMunicipalities
  };
});
