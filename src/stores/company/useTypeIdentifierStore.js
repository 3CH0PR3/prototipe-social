import { Http } from '@js/Services/Http.service';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTypeIdentifier = defineStore('typeIdentifier', () => {
  // =======================================
  // ================> STATE <==============
  identifiers = ref([]);
  isLoadingList = ref(false);
  errorMsg = ref(null);

  let fetchPromise = null;

  // ========================================
  // ===============> METHODS <==============
  const setLoading = (val) => (isLoadingList.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // ========================================
  // ===============> HELPERS <==============
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

  // ========================================
  // ==============> WATCHERS <==============
  watch(errorMsg, (err) => {
    if (!err) return;
    toast.error(err.response?.data?.message || 'Error inesperado');
    errorMsg.value = null;
  });

  // =======================================
  // ==============> ACTIONS <==============
  const fetchIdentifiers = async () => {
    return executeAsync(async () => {
      const response = Http.get('central/identifiers');
      identifiers.value = response || [];
      return identifiers.value;
    });
  };

  return {
    identifiers,
    isLoadingList,
    errorMsg,
    fetchIdentifiers
  };
});
