import { useToast } from '@js/Composables/useToast';
import { Http } from '@js/Services/Http.service';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export const useMunicipalityStore = defineStore('municipalities', () => {
  // =========================================
  // =============> COMPOSABLES <=============
  const toast = useToast();

  // =========================================
  // ================> STATE <================
  const municipalities = ref([]);
  const errorMsg = ref(null);
  const isLoadingMunicipalities = ref(false);
  const isFetchedMunicipalities = ref(false);

  let fetchPromise = null;

  // =========================================
  // ===============> METHODS <===============
  const setLoading = (val) => (isLoadingMunicipalities.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // =========================================
  // ===============> HELPERS <===============
  const executeAsync = async (fn) => {
    setLoading(true);
    clearError();
    try {
      return await fn();
    } catch (err) {
      setErrors(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ===============> COMPUTED <===============
  const countMunicipalities = computed(() => municipalities.value.length);

  // ========================================
  // ==============> WATCHERS <==============
  watch(errorMsg, (err) => {
    if (!err) return;
    toast.error(err.response?.data?.message || 'Error inesperado');
    errorMsg.value = null;
  });

  // ========================================
  // ===============> ACTIONS <===============
  const fetchMunicipalities = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetchedMunicipalities.value && !force) return municipalities.value;

    fetchPromise = executeAsync(async () => {
      const apiResponse = await Http.get('company/municipalities');

      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      municipalities.value = apiResponse.data.municipalities ?? [];
      isFetchedMunicipalities.value = true;

      return apiResponse;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  return {
    municipalities,
    isLoadingMunicipalities,
    isFetchedMunicipalities,

    // methods
    setLoading,
    setErrors,
    clearError,

    // computed
    countMunicipalities,

    // actions
    fetchMunicipalities
  };
});
