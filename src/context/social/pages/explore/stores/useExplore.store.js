import { defineStore } from 'pinia';
import { ref } from 'vue';
import { exploreService } from '../services/explore.service.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';

export const useExploreStore = defineStore('social.explore', () => {
  const people = ref([]);
  const loading = ref(false);
  const isSearching = ref(false);
  const friendshipStore = useFriendshipStore();

  // Pagination state
  const page = ref(1);
  const limit = ref(10);
  const hasMore = ref(true);
  const searchQuery = ref('');

  const currentType = ref('all');

  const loadExploreData = async (isLoadMore = false) => {
    if (loading.value || (!hasMore.value && isLoadMore) || isSearching.value) return;

    loading.value = true;
    try {
      if (!isLoadMore) {
        page.value = 1;
        people.value = [];
      } else {
        page.value += 1;
      }

      // For suggestions/explore, we call explore with empty query to get everything
      const response = await exploreService.explore({
        q: '',
        type: currentType.value
      });
      const dataPayload = response.data;

      const items = dataPayload.results || [];
      const newPeople = items.map((p) => {
        if (p.type === 'user') {
          friendshipStore.initStatus(p.id, {
            isFriend: false,
            hasPendingRequestFrom: false,
            hasSentPendingRequest: false
          });
        }
        return p;
      });

      if (isLoadMore) {
        people.value = [...people.value, ...newPeople];
      } else {
        people.value = newPeople;
      }

      // Backend limit currently is fixed and doesn't return hasMore, assume false for now
      hasMore.value = false;
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      loading.value = false;
    }
  };

  const setExploreType = (type) => {
    currentType.value = type;
    loadExploreData();
  };

  const searchResults = ref([]);

  const searchPeople = async (query, type = 'all') => {
    searchQuery.value = query;
    if (!query.trim()) {
      isSearching.value = false;
      searchResults.value = [];
      return;
    }

    isSearching.value = true;
    try {
      const response = await exploreService.explore({ q: query, type: type });
      const dataPayload = response.data;

      searchResults.value = dataPayload.results.map((p) => {
        if (p.type === 'user') {
          friendshipStore.initStatus(p.id, {
            isFriend: false, // We'd ideally need backend to send this
            hasPendingRequestFrom: false,
            hasSentPendingRequest: false
          });
        }
        return p;
      });
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      isSearching.value = false;
    }
  };

  const addFriend = async (userId) => {
    return friendshipStore.sendRequest(userId);
  };

  const followCompany = async (companyId) => {
    try {
      await exploreService.followCompany(companyId);
      // Optionally update local state
    } catch (error) {
      console.error('Error following company:', error);
    }
  };

  const removeSuggestion = (userId) => {
    people.value = people.value.filter((p) => (p.id || p.social_user_id) !== userId);
  };

  return {
    currentType,
    setExploreType,
    people,
    loading,
    isSearching,
    hasMore,
    searchQuery,
    searchResults,
    loadExploreData,
    searchPeople,
    addFriend,
    followCompany,
    removeSuggestion
  };
});
