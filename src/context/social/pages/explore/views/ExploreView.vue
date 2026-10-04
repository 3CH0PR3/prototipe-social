<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useExploreStore } from '../stores/useExplore.store.js';
import PersonCard from '../components/PersonCard.vue';
import CompanyCard from '../components/CompanyCard.vue';
import { useDebounceFn, onClickOutside, useIntersectionObserver } from '@vueuse/core';
import { Search, Loader2, X, Users } from '@lucide/vue';

const exploreStore = useExploreStore();
const localQuery = ref('');
const searchDropdownOpen = ref(false);
const searchContainerRef = ref(null);
const loadMoreTrigger = ref(null);

onMounted(() => {
  exploreStore.loadExploreData(); // Load initial
});

const people = computed(() => exploreStore.people || []);

const tabs = [
  { id: 'all', label: 'Todos' },
  { id: 'users', label: 'Usuarios' },
  { id: 'companies', label: 'Empresas' }
];

const changeTab = (tabId) => {
  exploreStore.setExploreType(tabId);
};

// Debounced search logic for the dropdown
const debouncedSearch = useDebounceFn((query) => {
  if (query.trim()) {
    exploreStore.searchPeople(query, exploreStore.currentType);
  }
}, 500);

watch(localQuery, (newVal) => {
  if (newVal.trim()) {
    searchDropdownOpen.value = true;
    debouncedSearch(newVal);
  } else {
    searchDropdownOpen.value = false;
  }
});

onClickOutside(searchContainerRef, () => {
  searchDropdownOpen.value = false;
});

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && exploreStore.hasMore && !exploreStore.loading) {
      exploreStore.loadExploreData(true);
    }
  },
  { rootMargin: '200px' }
);
</script>

<template>
  <main class="min-h-screen pb-20 md:pb-0 px-4 pt-4">
    <!-- <p class="soc-subtitle mb-4">Personas de GEA</p> -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-2 border-b border-gray-200 overflow-x-auto w-full md:w-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="changeTab(tab.id)"
          :class="[
            'px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2',
            exploreStore.currentType === tab.id
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="relative w-full md:w-80" ref="searchContainerRef">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-gray-400" />
        </div>
        <input
          v-model="localQuery"
          @focus="localQuery.trim() ? (searchDropdownOpen = true) : null"
          type="text"
          class="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
          placeholder="Buscar..."
        />
        <button
          v-if="localQuery"
          @click="
            localQuery = '';
            searchDropdownOpen = false;
          "
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <X class="h-4 w-4" />
        </button>

        <!-- Search Dropdown -->
        <div
          v-if="searchDropdownOpen"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto z-50 py-2"
        >
          <div
            v-if="exploreStore.isSearching"
            class="flex flex-col items-center justify-center py-6 text-gray-500"
          >
            <Loader2 class="h-6 w-6 text-green-600 animate-spin mb-2" />
            <span class="text-sm">Buscando...</span>
          </div>

          <div
            v-else-if="exploreStore.searchResults && exploreStore.searchResults.length === 0"
            class="py-6 px-4 text-center text-gray-500 text-sm"
          >
            No se encontraron resultados
          </div>

          <div v-else class="flex flex-col">
            <div
              v-for="item in exploreStore.searchResults"
              :key="item.id"
              class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <img
                :src="item.avatar || 'https://ui-avatars.com/api/?name=' + item.name"
                class="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ item.name }}
                </p>
                <p class="text-xs text-gray-500 truncate" v-if="item.username">@{{ item.username }}</p>
              </div>
              <button
                v-if="item.type === 'user' && !item.isFriend"
                @click.stop="exploreStore.addFriend(item.id)"
                class="text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative min-h-[400px]">
      <div
        v-if="people.length === 0 && !exploreStore.loading"
        class="flex flex-col items-center justify-center py-20 text-gray-500"
      >
        <Users class="h-12 w-12 text-gray-300 mb-4" />
        <p class="text-lg font-medium text-gray-900">No hay sugerencias por ahora</p>
      </div>

      <div class="flex flex-wrap justify-center gap-4 pb-6">
        <template v-for="item in people" :key="item.type + item.id">
          <PersonCard
            v-if="item.type === 'user'"
            :person="item"
            @add-friend="exploreStore.addFriend"
            @remove-suggestion="exploreStore.removeSuggestion"
          />
          <CompanyCard
            v-else-if="item.type === 'company'"
            :company="item"
            @follow="exploreStore.followCompany"
            @remove-suggestion="exploreStore.removeSuggestion"
          />
        </template>

        <template v-if="exploreStore.loading">
          <div
            v-for="i in 10"
            :key="`skeleton-${i}`"
            class="w-[200px] h-80 bg-gray-50 rounded-lg shadow-sm border border-gray-100 animate-pulse shrink-0 flex flex-col"
          >
            <div class="h-48 w-full bg-gray-200 rounded-t-lg"></div>
            <div class="p-3 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="pt-4 space-y-2">
                <div class="h-8 bg-gray-200 rounded w-full"></div>
                <div class="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Infinite Scroll Trigger -->
      <div v-if="people.length > 0 && exploreStore.hasMore" ref="loadMoreTrigger" class="h-4 w-full"></div>
    </div>
  </main>
</template>
