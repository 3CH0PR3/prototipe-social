<script setup>
import { computed, ref, onMounted } from 'vue';
import { Search, Plus, Users, LayoutGrid, List } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useGroupsStore } from '../stores/useGroups.store.js';
import GroupCard from '../components/GroupCard.vue';

const router = useRouter();
const groups = useGroupsStore();
const activeTab = ref('Todos');
const query = ref('');
const tabs = ['Todos', 'Mis grupos', 'Recomendados', 'Activos'];

onMounted(() => {
  groups.fetchItems();
});

const filteredGroups = computed(() =>
  groups.items.filter((group) => {
    const text = `${group.name} ${group.description} ${group.category}`.toLowerCase();
    const matchesQuery = text.includes(query.value.toLowerCase());
    const matchesTab =
      activeTab.value === 'Todos' ||
      (activeTab.value === 'Mis grupos' && group.joined) ||
      (activeTab.value === 'Recomendados' && group.recommended) ||
      (activeTab.value === 'Activos' && group.active);
    return matchesQuery && matchesTab;
  })
);

const openGroup = (group) => router.push(`/social/groups/${group.id}`);

const joinedGroupsCount = computed(() => groups.items.filter((g) => g.joined).length);
</script>

<template>
  <section class="soc-groups-view pb-20 md:pb-0">
    <!-- Header Minimalista (al estilo Feed) -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 my-4">
      <div>
        <p class="soc-subtitle my-1">COMUNIDADES QUE TRANSFORMAN</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Grupos</h1>
      </div>
      <button
        class="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm w-full md:w-auto"
        type="button"
        @click="router.push('/social/groups/create')"
      >
        <Plus :size="16" />
        Crear grupo
      </button>
    </div>

    <!-- Barra de básqueda y Tabs -->
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
      <div class="relative max-w-full mb-4">
        <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <Search :size="17" />
        </span>
        <input
          v-model="query"
          class="w-full bg-surface-alt border border-border rounded-full py-2.5 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-green-600 transition-colors"
          placeholder="Buscar grupos..."
          aria-label="Buscar grupos"
        />
      </div>

      <nav class="flex overflow-x-auto gap-1 hide-scrollbar" aria-label="Secciones de grupos">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="[
            'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            activeTab === tab
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-surface-alt'
          ]"
          type="button"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span
            v-if="tab === 'Mis grupos' && joinedGroupsCount > 0"
            class="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white"
          >
            {{ joinedGroupsCount }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Lista de Grupos -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm font-medium text-gray-500">
        {{ filteredGroups.length }}
        {{ filteredGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados' }}
      </p>
    </div>

    <div v-if="groups.isLoading" class="flex flex-col gap-4">
      <div v-for="i in 4" :key="i" class="h-48 bg-surface rounded-lg animate-pulse"></div>
    </div>

    <template v-else>
      <div v-if="filteredGroups.length" class="flex flex-col gap-4">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          @click="openGroup(group)"
          @toggle-membership="groups.toggleMembership(group)"
        />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface rounded-lg border border-dashed border-border mt-4"
      >
        <div
          class="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center text-gray-400 mb-4"
        >
          <Users :size="25" />
        </div>
        <h3 class="text-lg font-bold text-text-primary mb-1">No hay grupos para mostrar</h3>
        <p class="text-gray-500 text-sm max-w-xs">
          Intenta cambiar los filtros de básqueda o crea un nuevo grupo para tu comunidad.
        </p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
