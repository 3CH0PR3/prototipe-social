import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { ProfileService } from '../services/profile.service.js';
import { useToast } from '@shared/composables/useToast';
import { useFriendshipStore } from './useFriendship.store.js';
import { usePostStore } from './usePost.store.js';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';

/**
 * Store unificado de perfiles
 * Funciona tanto para "mi perfil" (/profile) como "perfiles públicos" (/profiles/:id)
 */
export const useProfileStore = defineStore('social.profile.unified', () => {
  const toast = useToast();
  const friendshipStore = useFriendshipStore();
  const postStore = usePostStore();
  const userStore = useUserStore();

  // Estado del perfil actual (sea propio o ajeno)
  const currentProfile = ref(null);
  const isLoading = ref(false);

  // Posts, amigos y solicitudes del perfil actual
  const posts = ref([]);
  const friends = ref([]);
  const requests = ref([]);

  // Lista de perfiles (para vista de )
  const profilesList = ref([]);
  const hasMore = ref(true);
  const nextCursor = ref(null);

  // Filters
  const searchQuery = ref('');

  /**
   * Cargar perfil por ID o username
   * Funciona para cualquier perfil (propio o ajeno)
   */
  const fetchProfile = async (idOrUsername) => {
    if (!idOrUsername) return null;

    isLoading.value = true;
    try {
      const res = await ProfileService.getProfile(idOrUsername);
      const profile = res.data?.profile || res.data?.data?.profile;

      if (!profile) {
        throw new Error('Perfil no encontrado');
      }

      currentProfile.value = profile;

      // Inicializar estado de amistad si no es mi perfil
      if (profile.social_user_id && profile.social_user_id !== userStore.user?.id) {
        friendshipStore.initStatus(profile.social_user_id, {
          isFriend: profile.is_friend || false,
          hasPendingRequestFrom: profile.is_pending_approval || profile.has_pending_request_from || false,
          hasSentPendingRequest: profile.has_pending_request || profile.has_sent_pending_request || false
        });
      }

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cargar posts del perfil actual
   */
  const fetchPosts = async (profileId) => {
    if (!profileId) return [];

    try {
      const res = await ProfileService.getProfilePosts(profileId);
      const rawPosts = res.data?.posts || res.data?.data?.posts || [];

      // Normalizar a array
      const postsArray = Array.isArray(rawPosts) ? rawPosts : Object.values(rawPosts);

      // Sincronizar con el post store central
      posts.value = postStore.syncPosts(postsArray);

      return posts.value;
    } catch (error) {
      console.error('Error fetching posts:', error);
      posts.value = [];
      return [];
    }
  };

  /**
   * Cargar amigos del perfil actual
   */
  const fetchFriends = async (profileId) => {
    if (!profileId) return [];

    try {
      const res = await ProfileService.getProfileFriends(profileId);
      const rawFriends = res.data?.friends || res.data?.data?.friends || [];

      friends.value = Array.isArray(rawFriends) ? rawFriends : [];

      // Inicializar todos como amigos en el friendship store
      friends.value.forEach((friend) => {
        if (friend.id) {
          friendshipStore.initStatus(friend.id, {
            isFriend: true,
            hasPendingRequestFrom: false,
            hasSentPendingRequest: false
          });
        }
      });

      return friends.value;
    } catch (error) {
      console.error('Error fetching friends:', error);
      friends.value = [];
      return [];
    }
  };

  /**
   * Cargar solicitudes de amistad (solo para mi perfil)
   */
  const fetchRequests = async (profileId) => {
    if (!profileId) return [];

    try {
      const res = await ProfileService.getProfileRequests(profileId);
      const rawRequests = res.data?.requests || res.data?.data?.requests || [];

      requests.value = Array.isArray(rawRequests) ? rawRequests : [];

      // Inicializar estados en friendship store
      requests.value.forEach((req) => {
        if (req.id) {
          friendshipStore.initStatus(req.id, {
            isFriend: false,
            hasPendingRequestFrom: true, // Request hacia mí
            hasSentPendingRequest: false
          });
        }
      });

      return requests.value;
    } catch (error) {
      console.error('Error fetching requests:', error);
      requests.value = [];
      return [];
    }
  };

  /**
   * Guardar cambios en el perfil
   */
  const saveProfile = async (userId, data) => {
    try {
      const res = await ProfileService.updateProfile(userId, data);

      if (res.success) {
        // Recargar perfil
        await fetchProfile(userId);

        // Si es mi perfil, actualizar también el user store
        if (userStore.user?.id === userId) {
          await userStore.fetchUser();
        }

        toast.success('Perfil actualizado');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
      return false;
    }
  };

  /**
   * Subir avatar
   */
  const uploadAvatar = async (userId, file) => {
    try {
      const res = await ProfileService.uploadAvatar(userId, file);

      if (res.success) {
        const avatarUrl = res.data?.avatar || res.data?.avatar_url;

        // Actualizar perfil actual
        if (currentProfile.value) {
          currentProfile.value.avatar_url = avatarUrl;
        }

        // Actualizar user store si es mi perfil
        if (userStore.user?.id === userId) {
          userStore.user.avatar_url = avatarUrl;
          await userStore.fetchUser();
        }

        // Actualizar avatar en posts
        postStore.updateAuthorAvatar(userId, avatarUrl);

        toast.success('Avatar actualizado');
        return avatarUrl;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir avatar');
      throw error;
    }
  };

  /**
   * Subir cover
   */
  const uploadCover = async (userId, file) => {
    try {
      const res = await ProfileService.uploadCover(userId, file);

      if (res.success) {
        const coverUrl = res.data?.cover_url || res.data?.cover;

        // Actualizar perfil actual
        if (currentProfile.value) {
          currentProfile.value.cover_url = coverUrl;
        }

        // Actualizar user store si es mi perfil
        if (userStore.user?.id === userId) {
          userStore.user.cover_url = coverUrl;
          await userStore.fetchUser();
        }

        toast.success('Portada actualizada');
        return coverUrl;
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error('Error al subir portada');
      throw error;
    }
  };

  /**
   * Buscar perfiles (para )
   */
  const searchProfiles = async (search = '', loadMore = false) => {
    try {
      const params = { search };
      if (loadMore && nextCursor.value) {
        params.cursor = nextCursor.value;
      }

      const res = await ProfileService.fetchData(params);
      const newProfiles = res.data?.data || [];

      if (loadMore) {
        profilesList.value = [...profilesList.value, ...newProfiles];
      } else {
        profilesList.value = newProfiles;
      }

      nextCursor.value = res.data?.next_cursor || null;
      hasMore.value = !!nextCursor.value;

      return profilesList.value;
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  };

  /**
   * Limpiar estado del perfil actual
   */
  const clearCurrent = () => {
    currentProfile.value = null;
    posts.value = [];
    friends.value = [];
    requests.value = [];
  };

  // Computed
  const isOwnProfile = computed(() => {
    if (!currentProfile.value || !userStore.user) return false;
    return (
      currentProfile.value.social_user_id === userStore.user.id ||
      currentProfile.value.id === userStore.user.id
    );
  });

  return {
    // Estado
    currentProfile,
    isLoading,
    posts,
    friends,
    requests,
    profilesList,
    hasMore,
    searchQuery,

    // Computed
    isOwnProfile,

    // Métodos
    fetchProfile,
    fetchPosts,
    fetchFriends,
    fetchRequests,
    saveProfile,
    uploadAvatar,
    uploadCover,
    searchProfiles,
    clearCurrent
  };
});
