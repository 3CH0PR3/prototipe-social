import { defineStore } from 'pinia';
import { ref } from 'vue';
import { publicationsService } from '../services/publications.service';
import { useToast } from '@shared/composables/useToast';
import { usePostStore } from '@social/shared/stores/usePost.store.js';

export const usePublicationsStore = defineStore('profile-publications', () => {
  const toast = useToast();
  const postStore = usePostStore();

  const posts = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchPosts = async (userId) => {
    if (!userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await publicationsService.fetchMyPosts(userId);
      const rawPosts = response.data.posts || response.data.feeds || [];

      // Sincronizar con postStore para mantener una única fuente de verdad
      posts.value = postStore.syncPosts(rawPosts);
    } catch (err) {
      error.value = err.message;
      toast.error('Error al cargar las publicaciones');
      console.error('Error fetching posts:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const addPost = (post) => {
    // Sincronizar el nuevo post con postStore antes de agregarlo
    const synced = postStore.syncPosts([post])[0];
    posts.value = [synced, ...posts.value];
  };

  const removePost = (postId) => {
    posts.value = posts.value.filter((p) => p.id !== postId);
    postStore.removePost(postId);
  };

  const updatePost = (postId, updates) => {
    const index = posts.value.findIndex((p) => p.id === postId);
    if (index !== -1) {
      // Actualizar en el postPool directamente
      Object.assign(posts.value[index], updates);
    }
  };

  const $reset = () => {
    posts.value = [];
    isLoading.value = false;
    error.value = null;
  };

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    addPost,
    removePost,
    updatePost,
    $reset
  };
});
