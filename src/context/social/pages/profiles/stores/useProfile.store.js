import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ProfilesService } from '../services/profiles.service.js';
import { useToast } from '@shared/composables/useToast';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';

export const useProfilesStore = defineStore('social.profiles', () => {
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

      const resp = await ProfilesService.fetchData(params);

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

  // --- Profile Specific Logic ---
  const currentProfile = ref(null);
  const currentProfilePosts = ref([]);
  const currentProfileFriends = ref([]);
  const isProfileLoading = ref(false);

  const fetchProfile = async (username) => {
    isProfileLoading.value = true;
    try {
      const res = await ProfilesService.getProfile(username);
      currentProfile.value = res.data?.profile || res.data?.data?.profile;

      if (currentProfile.value?.social_user_id) {
        const d = res.data?.data || res.data;
        useFriendshipStore().initStatus(currentProfile.value.social_user_id, {
          isFriend: d.isFriend || currentProfile.value.is_friend || false,
          hasPendingRequestFrom: d.isPendingApproval || currentProfile.value.is_pending_approval || false,
          hasSentPendingRequest: d.hasPendingRequest || currentProfile.value.has_pending_request || false
        });
      }

      return currentProfile.value;
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el perfil');
      throw error;
    } finally {
      isProfileLoading.value = false;
    }
  };

  const fetchProfilePosts = async (profileId) => {
    try {
      const res = await ProfilesService.getProfilePosts(profileId);
      const raw = res.data?.posts || res.data?.data?.posts || [];
      currentProfilePosts.value = Array.isArray(raw) ? raw : Object.values(raw);
    } catch (error) {
      console.error('Error loading profile posts:', error);
      currentProfilePosts.value = [];
    }
  };

  const fetchProfileFriends = async (profileId) => {
    try {
      const res = await ProfilesService.getProfileFriends(profileId);
      currentProfileFriends.value = res.data?.friends || res.data?.data?.friends || [];
    } catch (error) {
      console.error('Error loading profile friends:', error);
      currentProfileFriends.value = [];
    }
  };

  const setSearchFilter = (search) => {
    filters.value.search = search;
    fetchItems(false, true);
  };

  const createItem = async (data) =>
    executeAsync(async () => {
      const resp = await ProfilesService.create(data);
      const created = resp.data?.data;
      if (created) {
        items.value.unshift(created);
      }
      toast.success('Registro creado exitosamente');
      return created;
    });

  const updateItem = async (id, data) =>
    executeAsync(async () => {
      const resp = await ProfilesService.update(id, data);
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
      await ProfilesService.delete(id);
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

    currentProfile,
    currentProfilePosts,
    currentProfileFriends,
    isProfileLoading,
    fetchProfile,
    fetchProfilePosts,
    fetchProfileFriends,

    fetchItems,
    setSearchFilter,
    createItem,
    updateItem,
    deleteItem
  };
});
