import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { MassBalanceService } from '@js/Services/MassBalance.service';
import { useToast } from '@js/Composables/useToast';
import { eventBus, EVENTS } from '@js/Utils/eventBus';

export const useMassBalanceStore = defineStore('mass-balances', () => {
  const toast = useToast();

  const balances = ref([]);
  const ecas = ref([]);
  const macroRoutes = ref([]);
  const materialTypes = ref([]);
  const siteRefusedTypes = ref([]);
  const weekDays = ref([]);
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

  const fetchBalances = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetched.value && !force) return balances.value;

    fetchPromise = exec(async () => {
      const res = await MassBalanceService.fetchAll();
      balances.value = res.data.balances || [];
      ecas.value = res.data.ecas || [];
      macroRoutes.value = res.data.macroRoutes || [];
      materialTypes.value = res.data.materialTypes || [];
      siteRefusedTypes.value = res.data.siteRefusedTypes || [];
      weekDays.value = res.data.weekDays || [];
      isFetched.value = true;
      return res;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  const createBalance = async (payload) =>
    exec(async () => {
      const res = await MassBalanceService.create(payload);
      if (!res.success || res.code !== 201) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      balances.value = [res.data.balance, ...balances.value];
      return res;
    });

  const updateBalance = async (id, payload) =>
    exec(async () => {
      const res = await MassBalanceService.update(id, payload);
      if (!res.success || res.code !== 200) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      const idx = balances.value.findIndex((b) => b.id == id);
      if (idx !== -1) balances.value.splice(idx, 1, res.data.balance);
      return res;
    });

  const deleteBalance = async (id) =>
    exec(async () => {
      const res = await MassBalanceService.delete(id);
      if (!res.success || res.code !== 200) {
        toast.error(res.message);
        throw new Error(res.message);
      }
      toast.success(res.message);
      eventBus.emit(EVENTS.REFRESH_NOTIFICATIONS);
      balances.value = balances.value.filter((b) => b.id != id);
      return res;
    });

  return {
    balances,
    ecas,
    macroRoutes,
    materialTypes,
    siteRefusedTypes,
    weekDays,
    isFetched,
    isLoading,
    fetchBalances,
    createBalance,
    updateBalance,
    deleteBalance
  };
});
