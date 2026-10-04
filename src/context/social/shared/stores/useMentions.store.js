import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProfilesService } from '@social/pages/profiles/services/profiles.service';

export const useMentionsStore = defineStore('social.mentions', () => {
  const suggestions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  let searchTimeout = null;

  const searchUsers = async (query) => {
    if (!query || query.length < 1) {
      suggestions.value = [];
      return;
    }

    clearTimeout(searchTimeout);
    isLoading.value = true;
    error.value = null;

    return new Promise((resolve) => {
      searchTimeout = setTimeout(async () => {
        try {
          // Usar ProfilesService.search() existente
          const res = await ProfilesService.search(query);
          // Adaptarse a diferentes estructuras de respuesta del backend
          suggestions.value = res.data?.items || res.data?.data?.items || res.data?.users || [];
          resolve(suggestions.value);
        } catch (err) {
          error.value = err;
          suggestions.value = [];
          console.error('Error buscando usuarios para menciones:', err);
          resolve([]);
        } finally {
          isLoading.value = false;
        }
      }, 300);
    });
  };

  const clearSuggestions = () => {
    suggestions.value = [];
    isLoading.value = false;
    error.value = null;
  };

  return {
    suggestions,
    isLoading,
    error,
    searchUsers,
    clearSuggestions
  };
});
