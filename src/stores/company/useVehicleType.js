import { useToast } from '@js/Composables/useToast';
import { Http } from '@js/Services/Http.service';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export const useVehicleTypeStore = defineStore('vehicleTypes', () => {
  // =========================================
  // ===============> COMPOSABLES <==========
  const toast = useToast();

  // =========================================
  // ================> STATE <================
  const vehicleTypes = ref([]);
  const errorMsg = ref(null);
  const isLoadingVehicleTypes = ref(false);
  const isFetchedVehicleTypes = ref(false);

  let fetchPromise = null;

  // =========================================
  // ===============> METHODS <===============
  const setLoading = (val) => (isLoadingVehicleTypes.value = val);
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
  const countVehicleTypes = computed(() => vehicleTypes.value.length);

  // =========================================
  // ===============> WATCHERS <===============
  watch(errorMsg, (err) => {
    if (!err) return;

    const msg = err?.response?.data?.message || 'Error inesperado';
    toast.error(msg);

    errorMsg.value = null;
  });

  // =========================================
  // ===============> ACTIONS <===============
  const fetchVehicleTypes = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetchedVehicleTypes.value && !force) return vehicleTypes.value;

    fetchPromise = executeAsync(async () => {
      const apiResponse = await Http.get('company/resolutions/vehicle-types');

      vehicleTypes.value = apiResponse.data.vehicleTypes ?? [];
      isFetchedVehicleTypes.value = true;

      return vehicleTypes.value;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  return {
    vehicleTypes,
    isLoadingVehicleTypes,
    isFetchedVehicleTypes,

    // Methods
    setLoading,
    setErrors,
    clearError,

    // Computed
    countVehicleTypes,

    // Actions
    fetchVehicleTypes
  };
});
