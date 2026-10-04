import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { AddressCodeService } from '@js/Services/AddressCode.service';
import { useWindowSize } from '@vueuse/core';
import { useDatatable } from '@js/Composables/System/useDatatables';
import { useToast } from '@js/Composables/useToast';
import { eventBus, EVENTS } from '@js/Utils/eventBus';

export const useAddressCodesStore = defineStore('suscriber-address-codes', () => {
  const codes = ref([]);
  const metrics = ref({});
  const metadatas = ref({});
  const statistics = ref({});
  const errorMsg = ref(null);
  const isLoadingCodes = ref(false);
  const isFetchedCodes = ref(false);

  let fetchPromise = null;

  // =========================================
  // ===============> METHODS <===============
  const setLoading = (val) => (isLoadingCodes.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // ========================================
  // ==============> HELPERS <===============
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

  // =========================================
  // ===============> ACTIONS <===============
  const fetchAddressCodes = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetchedCodes.value && !force) return codes.value;

    fetchPromise = executeAsync(async () => {
      const apiResponse = await AddressCodeService.fetchAll();

      codes.value = apiResponse.data.codes || [];
      isFetchedCodes.value = true;

      return apiResponse;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  const createAddressCode = async (payload) => {
    return executeAsync(async () => {
      const apiResponse = await AddressCodeService.create(payload);

      if (apiResponse.success !== true || apiResponse.code !== 201) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      const newAddressCode = apiResponse.data.code || {};
      codes.value = [newAddressCode, ...codes.value];

      return apiResponse;
    });
  };

  const updateAddressCode = async (id, payload) => {
    return executeAsync(async () => {
      const apiResponse = await AddressCodeService.update(id, payload);

      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      const updatedAddressCode = apiResponse.data.code || {};
      const index = codes.value.findIndex((c) => Number(c.id) === Number(id));

      if (index !== -1) {
        codes.value.splice(index, 1, updatedAddressCode);
      }

      return apiResponse;
    });
  };

  const deleteAddressCode = async (id, payload) => {
    return executeAsync(async () => {
      const apiResponse = await AddressCodeService.delete(id, payload);

      if (apiResponse.success !== true || apiResponse.code !== 200) {
        toast.error(apiResponse.message);
        throw new Error(apiResponse.message);
      }

      toast.success(apiResponse.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);

      return apiResponse;
    });
  };

  return {
    codes,
    metrics,
    metadatas,
    statistics,

    isLoadingCodes,
    isFetchedCodes,

    fetchAddressCodes,
    createAddressCode,
    updateAddressCode,
    deleteAddressCode
  };
});
