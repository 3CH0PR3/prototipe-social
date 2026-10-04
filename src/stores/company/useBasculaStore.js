import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { BasculaService } from '@js/Services/BasculaService';
import { useToast } from '@js/Composables/useToast';
import { eventBus, EVENTS } from '@js/Utils/eventBus';

export const useBasculaStore = defineStore('basculas', () => {
  const toast = useToast();

  const basculas = ref([]);
  const ecas = ref([]);
  const errorMsg = ref(null);

  const isFetched = ref(false);
  const isLoading = ref(false);

  let fetchPromise = null;

  const setLoading = (v) => (isLoading.value = v);
  const clearError = () => (errorMsg.value = null);

  watch(errorMsg, (err) => {
    if (!err) return;
    toast.error(err.response?.data?.message || 'Error inesperado');
    errorMsg.value = null;
  });

  const exec = async (fn) => {
    setLoading(true);
    clearError();
    try {
      return await fn();
    } catch (err) {
      errorMsg.value = err;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBasculas = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetched.value && !force) return basculas.value;

    fetchPromise = exec(async () => {
      const res = await BasculaService.fetchAll();
      basculas.value = res.data.basculas || [];
      ecas.value = res.data.ecas || [];
      isFetched.value = true;
      return res;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  const createBascula = async (payload) =>
    exec(async () => {
      const res = await BasculaService.create(payload);
      if (!res.success || res.code !== 201) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      basculas.value = [res.data.bascula, ...basculas.value];
      return res;
    });

  const updateBascula = async (id, payload) =>
    exec(async () => {
      const res = await BasculaService.update(id, payload);
      if (!res.success || res.code !== 200) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      const idx = basculas.value.findIndex((b) => b.id == id);
      if (idx !== -1) basculas.value.splice(idx, 1, res.data.bascula);
      return res;
    });

  const deleteBascula = async (id) =>
    exec(async () => {
      const res = await BasculaService.delete(id);
      if (!res.success || res.code !== 200) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      basculas.value = basculas.value.filter((b) => b.id != id);
      return res;
    });

  return {
    basculas,
    ecas,
    isFetched,
    isLoading,
    fetchBasculas,
    createBascula,
    updateBascula,
    deleteBascula
  };
});
