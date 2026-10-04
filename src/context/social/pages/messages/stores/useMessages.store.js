import { ref } from 'vue';
import { defineStore } from 'pinia';
import { MessagesService } from '../services/messages.service.js';
import { useToast } from '@shared/composables/useToast';

export const useMessagesStore = defineStore('social.messages', () => {
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
      toast.error(err.response?.data?.message ?? 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (isLoadMore = false, force = false) => {
    if (fetchPromise && !force) return fetchPromise;
    if (!isLoadMore && isFetched.value && !force && !filters.value.search) {
      return items.value;
    }

    if (isLoadMore && !hasMore.value) return items.value;

    return (fetchPromise = executeAsync(async () => {
      const params = {};
      if (filters.value.search) params.search = filters.value.search;
      if (isLoadMore && nextCursor.value) params.cursor = nextCursor.value;

      const resp = await MessagesService.fetchData(params);

      const newItems = resp.data?.data ?? [];

      if (isLoadMore) {
        items.value = [...items.value, ...newItems];
      } else {
        items.value = newItems;
      }

      nextCursor.value = resp.data?.next_cursor ?? null;
      hasMore.value = resp.data?.next_cursor != null;
      isFetched.value = true;

      return items.value;
    }).finally(() => (fetchPromise = null)));
  };

  const setSearchFilter = (search) => {
    filters.value.search = search;
    fetchItems(false, true);
  };

  const createItem = async (data) =>
    executeAsync(async () => {
      const resp = await MessagesService.create(data);
      const created = resp.data?.data;
      if (created) {
        items.value.unshift(created);
      }
      toast.success('Registro creado exitosamente');
      return created;
    });

  const updateItem = async (id, data) =>
    executeAsync(async () => {
      const resp = await MessagesService.update(id, data);
      const updated = resp.data?.data;
      if (updated) {
        const idx = items.value.findIndex((a) => a.id === updated.id);
        if (idx !== -1) items.value[idx] = updated;
      }
      toast.success('Registro actualizado exitosamente');
      return updated;
    });

  const deleteItem = async (id) =>
    executeAsync(async () => {
      await MessagesService.delete(id);
      items.value = items.value.filter((a) => a.id !== id);
      toast.success('Registro eliminado exitosamente');
    });

  return {
    items,
    filters,
    errorMsg,
    isFetched,
    isLoading,
    hasMore,

    fetchItems,
    setSearchFilter,
    createItem,
    updateItem,
    deleteItem
  };
});
