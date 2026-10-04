import { RolesService } from '@globalServices/Roles.service';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useRolesStore = defineStore('central.roles', () => {
  const roles = ref([]);
  const errorMsg = ref(null);
  const isFetchedRoles = ref(false);
  const isLoadingRoles = ref(false);

  let fetchPromise = null;

  const setLoading = (val) => (isLoadingRoles.value = val);
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

  const fetchRoles = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (isFetchedRoles.value && !force) return roles.value;

    fetchPromise = executeAsync(async () => {
      const apiResponse = await RolesService.fetch();

      roles.value = apiResponse.data.roles || [];
      isFetchedRoles.value = true;

      return roles.value;
    }).finally(() => {
      fetchPromise = null;
    });

    return fetchPromise;
  };

  return {
    roles,
    errorMsg,
    isFetchedRoles,
    isLoadingRoles,

    fetchRoles
  };
});
