import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from '@shared/composables/useToast';
import { GroupsService } from '../services/groups.service.js';
import { Http } from '@shared/http/Http';
import { useUserStore } from '../../user/stores/useUser.store.js';

export const useGroupsStore = defineStore('social.groups', () => {
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

      const resp = await GroupsService.fetchData(params);

      const newItems = resp.data?.items || resp.data?.data || [];

      if (isLoadMore) {
        items.value = [...items.value, ...newItems];
      } else {
        items.value = newItems;
      }

      nextCursor.value = resp.meta?.next_cursor ?? resp.data?.next_cursor ?? null;
      hasMore.value = resp.meta?.next_cursor != null || resp.data?.next_cursor != null;
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
      const userStore = useUserStore();
      const payload = {
        ...data,
        owner_id: userStore.user?.id,
        slug: data.name
          ? data.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
          : ''
      };
      const resp = await GroupsService.create(payload);
      const created = resp.data?.item || resp.data?.data || null;
      if (created) {
        items.value.unshift(created);
      }
      toast.success('Grupo creado exitosamente');
      return created;
    });

  const updateItem = async (id, data) =>
    executeAsync(async () => {
      const resp = await GroupsService.update(id, data);
      const updated = resp.data?.item || resp.data?.data || null;
      if (updated) {
        const idx = items.value.findIndex((a) => a.id === updated.id);
        if (idx !== -1) items.value[idx] = updated;
      }
      toast.success('Grupo actualizado exitosamente');
      return updated;
    });

  const deleteItem = async (id) =>
    executeAsync(async () => {
      await GroupsService.delete(id);
      items.value = items.value.filter((a) => a.id !== id);
      toast.success('Grupo eliminado exitosamente');
    });

  const toggleMembership = async (group) =>
    executeAsync(async () => {
      if (group.joined) {
        await GroupsService.leave(group.id);
      } else {
        await GroupsService.join(group.id);
      }

      const idx = items.value.findIndex((a) => a.id === group.id);
      if (idx !== -1) {
        items.value[idx].joined = !items.value[idx].joined;
        if (items.value[idx].joined) {
          items.value[idx].members_count = (items.value[idx].members_count || 0) + 1;
        } else {
          items.value[idx].members_count = Math.max(0, (items.value[idx].members_count || 0) - 1);
        }
      }
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
    deleteItem,
    toggleMembership
  };
});
