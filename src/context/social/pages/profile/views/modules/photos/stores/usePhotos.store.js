import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { photosService } from '../services/photos.service';
import { useToast } from '@shared/composables/useToast';

export const usePhotosStore = defineStore('profile-photos', () => {
  const toast = useToast();

  const posts = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Extrae todas las imágenes de los posts
  const photos = computed(() => {
    const allPhotos = [];
    posts.value.forEach((post) => {
      if (Array.isArray(post.images)) {
        post.images.forEach((img) => allPhotos.push(img));
      } else if (post.image) {
        allPhotos.push(post.image);
      }
    });
    return allPhotos;
  });

  const fetchPhotos = async (userId) => {
    if (!userId) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await photosService.fetchUserPhotos(userId);
      posts.value = response.data.posts || response.data.feeds || [];
    } catch (err) {
      error.value = err.message;
      toast.error('Error al cargar las fotos');
      console.error('Error fetching photos:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const $reset = () => {
    posts.value = [];
    isLoading.value = false;
    error.value = null;
  };

  return {
    posts,
    photos,
    isLoading,
    error,
    fetchPhotos,
    $reset
  };
});
