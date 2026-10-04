import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

import { useToast } from '@shared/composables/useToast';
import { ResolutionsService } from '@globalServices/company/resolutions.service';

export const useResolutionStore = defineStore('company.resolutions', () => {
  const toast = useToast();

  // STATE
  const resolutions = ref([]);
  const resolutionDetails = ref(new Map());
  const metadatas = ref({});
  const errorMsg = ref(null);
  const isFetched = ref(false);
  const isLoading = ref(false);
  const lastFetchTime = ref(null);

  let fetchPromise = null;
  const CACHE_DURATION = 5 * 60 * 1000;

  // COMPUTED
  const isCacheValid = computed(() => {
    if (!lastFetchTime.value) return false;
    return Date.now() - lastFetchTime.value < CACHE_DURATION;
  });

  // METHODS
  const setLoading = (val) => (isLoading.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  // HELPERS
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

  // ACTIONS
  const fetchResolutions = async (force = false) => {
    if (fetchPromise && !force) return fetchPromise;

    if (isFetched.value && isCacheValid.value && !force) {
      return resolutions.value;
    }


    return (fetchPromise = executeAsync(async () => {
      const resp = await ResolutionsService.fetchAll();

      resolutions.value = resp.data.resolutions ?? [];
      metadatas.value = resp.data.metadata ?? {};
      lastFetchTime.value = Date.now();
      isFetched.value = true;

      return resolutions.value;
    }).finally(() => (fetchPromise = null)));
  };

  // Obtener resolución por slug (con caché individual)
  const getResolutionBySlug = (slug) => {
    return resolutions.value.find((resolution) => resolution.slug === slug);
  };

  // Obtener detalles de una resolución específica (con caché)
  const fetchResolutionDetails = async (slug, force = false) => {
    // Verificar caché local primero
    if (resolutionDetails.value.has(slug) && !force) {

      return resolutionDetails.value.get(slug);
    }


    return executeAsync(async () => {
      const resp = await ResolutionsService.fetchBySlug(slug);
      const details = resp.data;

      // Guardar en caché
      resolutionDetails.value.set(slug, details);

      return details;
    });
  };

  // Crear nueva resolución
  const createResolution = async (data) => {
    return executeAsync(async () => {
      const response = await ResolutionsService.create(data);

      // Invalidar caché para refrescar la lista
      await invalidateCache();
      await fetchResolutions(true);

      toast.success('Resolución creada exitosamente');
      return response.data;
    });
  };

  // Actualizar resolución existente
  const updateResolution = async (slug, data) => {
    return executeAsync(async () => {
      const response = await ResolutionsService.update(slug, data);

      // Actualizar caché local
      updateResolutionInCache(response.data);

      // También invalidar caché del servidor
      await ResolutionsService.invalidateCache();

      toast.success('Resolución actualizada exitosamente');
      return response.data;
    });
  };

  // Eliminar resolución
  const deleteResolution = async (slug) => {
    return executeAsync(async () => {
      await ResolutionsService.delete(slug);

      // Remover del caché local
      resolutions.value = resolutions.value.filter((r) => r.slug !== slug);
      resolutionDetails.value.delete(slug);

      // Invalidar caché del servidor
      await ResolutionsService.invalidateCache();

      toast.success('Resolución eliminada exitosamente');
    });
  };

  // Invalidar caché (útil cuando se actualiza una resolución)
  const invalidateCache = async () => {

    isFetched.value = false;
    lastFetchTime.value = null;
    resolutionDetails.value.clear();

    // También invalidar en el servidor
    try {
      await ResolutionsService.invalidateCache();
    } catch (error) {
      console.warn('Could not invalidate server cache:', error);
    }
  };

  // Actualizar una resolución específica en el caché
  const updateResolutionInCache = (updatedResolution) => {
    const index = resolutions.value.findIndex((r) => r.id === updatedResolution.id);
    if (index !== -1) {
      resolutions.value[index] = updatedResolution;
      // También actualizar el caché de detalles si existe
      if (resolutionDetails.value.has(updatedResolution.slug)) {
        resolutionDetails.value.set(updatedResolution.slug, updatedResolution);
      }
    }
  };

  return {
    // State
    resolutions,
    resolutionDetails,
    metadatas,
    isLoading,
    isFetched,
    isCacheValid,

    // Actions
    fetchResolutions,
    getResolutionBySlug,
    fetchResolutionDetails,
    createResolution,
    updateResolution,
    deleteResolution,
    invalidateCache,
    updateResolutionInCache
  };
});
