<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Bell, Bookmark, Compass, Home, Leaf, Menu, Search, Users, ArrowLeft, Clock, X } from '@lucide/vue';
import { onClickOutside } from '@vueuse/core';
import NotifPanel from '@social/pages/notifications/components/NotifPanel.vue';
import SocialDropdownProfile from '@/layouts/social/components/SocialDropdownProfile.vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import { useNotificationsStore } from '@social/pages/notifications/stores/useNotifications.store.js';

const props = defineProps({
  isFullWidth: Boolean
});

const emit = defineEmits(['toggle-mobile-menu']);
const router = useRouter();
const route = useRoute();

const query = ref('');
const notifOpen = ref(false);
const accountOpen = ref(false);
const searchActive = ref(false);
const searchContainerRef = ref(null);
const searchInputRef = ref(null);

const recentSearches = ref([]);

onClickOutside(searchContainerRef, () => {
  searchActive.value = false;
});

const activateSearch = async () => {
  searchActive.value = true;
  await nextTick();
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
};

const closeSearch = () => {
  searchActive.value = false;
};

const removeSearch = (id) => {
  recentSearches.value = recentSearches.value.filter((s) => s.id !== id);
};

const userStore = useUserStore();
const { fullName, avatar } = useProfile(userStore.user);
const notifStore = useNotificationsStore();
const unreadCount = computed(() => notifStore.unreadCount);

const toggleNotif = () => {
  notifOpen.value = !notifOpen.value;
  accountOpen.value = false;
};
const closeNotif = () => (notifOpen.value = false);

const nav = [
  { label: 'Inicio', icon: Home, name: 'social.feed' },
  { label: 'Grupos', icon: Users, name: 'social.groups' },
  { label: 'Explorar', icon: Compass, name: 'social.explore' }
];

const isActive = (name) => route.name === name;
const go = (name) => {
  router.push({ name });
  accountOpen.value = false;
  notifOpen.value = false;
};
const search = () => {
  if (query.value.trim()) {
    router.push({ name: 'social.explore', query: { q: query.value } });
    searchActive.value = false;
  }
};
</script>

<template>
  <header v-if="isFullWidth" class="soc-navbar">
    <button class="soc-navbar-brand" @click="go('social.feed')">
      <span class="soc-navbar-brand-icon">
        <Leaf :size="18" />
      </span>
      <span class="soc-navbar-brand-text">
        <strong class="soc-navbar-brand-title">GEA</strong>
        <small class="text-green-600 text-[10px] font-bold mt-0.5">social</small>
      </span>
    </button>
    <nav class="soc-navbar-nav">
      <button
        v-for="item in nav"
        :key="item.name"
        class="soc-nav-link"
        :class="{ active: isActive(item.name) }"
        @click="go(item.name)"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
    <div class="flex items-center gap-2">
      <button class="soc-btn-secondary" @click="go('social.feed')">
        <span>Volver</span>
      </button>
    </div>
  </header>

  <!-- Default Navbar -->
  <header v-else class="soc-navbar">
    <div class="soc-navbar-inner">
      <!-- Left Section: Logo + Search -->
      <div class="soc-navbar-search-container" ref="searchContainerRef">
        <button class="soc-navbar-logo" @click="go('social.feed')">
          <span class="soc-navbar-brand-icon">
            <Leaf :size="18" />
          </span>
          <span class="soc-navbar-brand-text leading-[1.1] gap-0 hidden-mobile">
            <strong class="soc-navbar-brand-title">GEA</strong>
            <small class="text-green-600 text-[11px] font-bold">social</small>
          </span>
        </button>

        <!-- Móvil: Botón circular -->
        <button
          v-if="!searchActive"
          type="button"
          class="soc-navbar-search-btn-mobile"
          @click="activateSearch"
          aria-label="Buscar en GEA-social"
        >
          <Search :size="18" />
        </button>

        <!-- Desktop: Input normal (trigger) -->
        <div
          class="hidden sm:flex items-center bg-gray-100 rounded-full px-4 h-10 gap-2 min-w-[240px] cursor-text hover:bg-gray-200 transition-colors"
          @click="activateSearch"
        >
          <Search :size="18" class="text-gray-500 shrink-0" />
          <span class="text-[14px] text-gray-500 w-full text-left truncate">Buscar en GEA-social</span>
        </div>

        <!-- Mobile: Pantalla completa -->
        <div
          v-if="searchActive"
          class="fixed sm:hidden top-0 left-0 right-0 bottom-0 w-full h-full z-[60] bg-white flex flex-col"
        >
          <!-- Header con flecha atrás -->
          <div class="flex items-center gap-2 px-2 py-2 border-b border-gray-200">
            <button
              type="button"
              class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              @click="closeSearch"
              aria-label="Cerrar búsqueda"
            >
              <ArrowLeft :size="15" />
            </button>
            <form class="flex-1" @submit.prevent="search">
              <input
                :ref="
                  (el) => {
                    if (el) searchInputRef = el;
                  }
                "
                v-model="query"
                placeholder="Buscar en GEA-social"
                class="w-full bg-gray-100 rounded-md h-8 px-4 text-xs md:text-sm outline-none border-none ring-0 focus:ring-0 text-gray-900 placeholder-gray-500"
              />
            </form>
          </div>

          <!-- Contenido Mobile -->
          <div class="flex-1 overflow-y-auto px-4 py-3">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs md:text-sm font-semibold text-gray-900">Recientes</span>
            </div>

            <div v-if="recentSearches.length">
              <div
                v-for="item in recentSearches"
                :key="item.id"
                class="w-full flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-lg group border-0 bg-transparent cursor-pointer"
                @click="query = item.text; search()"
              >
                <div
                  class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0"
                >
                  <Clock :size="12" />
                </div>
                <span class="text-xs md:text-sm font-medium text-gray-900 flex-1 text-left">
                  {{ item.text }}
                </span>
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all shrink-0"
                  @click.stop="removeSearch(item.id)"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500 text-xs md:text-sm">
              No hay búsquedas recientes
            </div>
          </div>
        </div>

        <!-- Desktop: Active Search Panel (Facebook style) -->
        <div
          v-if="searchActive"
          class="hidden sm:block absolute top-[-8px] -left-[16px] w-[320px] lg:w-[360px] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[100] pb-2"
        >
          <!-- Panel Header con input activo (simula la altura y padding del navbar) -->
          <div class="flex items-center gap-2 h-14 px-2">
            <button
              class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors shrink-0 border-0 bg-transparent cursor-pointer"
              @click.stop="closeSearch"
            >
              <ArrowLeft :size="20" />
            </button>
            <div class="flex-1 bg-gray-100 rounded-full px-4 h-10 flex items-center">
              <input
                :ref="
                  (el) => {
                    if (el) searchInputRef = el;
                  }
                "
                v-model="query"
                placeholder="Buscar en GEA-social"
                class="w-full bg-transparent border-none outline-none text-[14px] text-gray-900 placeholder-gray-500 focus:ring-0 px-0"
                @keydown.enter.prevent="search"
              />
            </div>
          </div>

          <div class="px-2 pb-4 overflow-y-auto max-h-[450px]">
            <div class="flex items-center justify-between mb-2 mt-2 px-2">
              <span class="text-[15px] font-semibold text-gray-900">Recientes</span>
              <button
                class="text-blue-600 text-[14px] hover:bg-gray-100 px-2 py-1 rounded border-0 bg-transparent cursor-pointer"
              >
                Editar
              </button>
            </div>

            <div v-if="recentSearches.length">
              <div
                v-for="item in recentSearches"
                :key="item.id"
                class="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg group border-0 bg-transparent cursor-pointer"
                @click="query = item.text; search()"
              >
                <div
                  class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0"
                >
                  <Clock :size="18" />
                </div>
                <span class="text-[15px] font-medium text-gray-900 flex-1 text-left">{{ item.text }}</span>
                <button
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all shrink-0"
                  @click.stop="removeSearch(item.id)"
                >
                  <X :size="16" />
                </button>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-500 text-sm">No hay búsquedas recientes</div>
          </div>
        </div>
      </div>

      <!-- Center Section: Navigation -->
      <nav class="soc-navbar-nav">
        <button
          v-for="item in nav"
          :key="item.name"
          class="soc-nav-link"
          :class="{ active: isActive(item.name) }"
          @click="go(item.name)"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Right Section: Actions -->
      <div class="soc-navbar-actions">
        <div class="relative">
          <button
            class="relative soc-btn-icon"
            :class="{ 'bg-green-50 text-green-600': notifOpen }"
            aria-label="Notificaciones"
            @click="toggleNotif"
          >
            <Bell :size="18" />
            <i
              v-if="unreadCount"
              class="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 border-2 border-white rounded-full bg-red-500 text-white text-[9px] font-black italic flex items-center justify-center pointer-events-none"
            >
              {{ unreadCount }}
            </i>
          </button>
          <NotifPanel
            v-if="notifOpen"
            @close="closeNotif"
            class="absolute top-[calc(100%+8px)] right-[-14px] sm:right-[-14px] z-[55] w-[96vw] max-w-[380px] border border-gray-200 bg-white shadow-lg rounded-xl"
          />
        </div>
        <SocialDropdownProfile :user="userStore.user" />
        <button class="lg:!hidden soc-btn-icon" @click="emit('toggle-mobile-menu')" aria-label="Abrir menú">
          <Menu :size="18" />
        </button>
      </div>
    </div>
  </header>
</template>
