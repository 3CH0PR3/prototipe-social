<script setup>
import { computed } from 'vue';
import { Home, User, Compass, Users, Bookmark, Settings, Edit3, X } from '@lucide/vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);
const userStore = useUserStore();

const closeMenu = () => {
  emit('close');
};

const myProfileRoute = computed(() => {
  const userId = userStore.user?.id;
  return userId ? { name: 'social.profiles.publications', params: { id: userId } } : { name: 'social.feed' };
});
</script>

<template>
  <Teleport to="body">
    <!-- Overlay Transition -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] lg:hidden"
        @click="closeMenu"
      ></div>
    </Transition>

    <!-- Menu Panel Transition -->
    <Transition
      enter-active-class="transition ease-in-out duration-300 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in-out duration-300 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-y-0 left-0 z-[70] w-full max-w-[280px] bg-white dark:bg-[#0b0e14] shadow-2xl flex flex-col lg:hidden border-r border-gray-100 dark:border-[#1a1f29]"
      >
        <div
          class="px-4 py-6 flex items-center justify-between border-b border-gray-100 dark:border-[#1a1f29]"
        >
          <span class="soc-mobile-menu-brand">
            GEA-
            <span class="text-[#009F55] font-normal">Social</span>
          </span>
          <button
            @click="closeMenu"
            class="soc-mobile-menu-close"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="soc-mobile-menu-body">
          <p class="soc-subtitle px-3 mb-2">Explora GEA</p>
          <router-link
            :to="{ name: 'social.feed' }"
            class="soc-nav-link"
            active-class="active"
            @click="closeMenu"
          >
            <Home :size="18" />
            <span>Inicio</span>
          </router-link>
          <router-link :to="myProfileRoute" class="soc-nav-link" active-class="active" @click="closeMenu">
            <User :size="18" />
            <span>Mi Perfil</span>
          </router-link>
          <router-link
            :to="{ name: 'social.explore' }"
            class="soc-nav-link"
            active-class="active"
            @click="closeMenu"
          >
            <Compass :size="18" />
            <span>Explorar</span>
          </router-link>
          <router-link
            :to="{ name: 'social.groups' }"
            class="soc-nav-link"
            active-class="active"
            @click="closeMenu"
          >
            <Users :size="18" />
            <span>Grupos</span>
          </router-link>
          <div class="my-4 border-t border-gray-100 dark:border-[#1a1f29]"></div>
          <p class="soc-subtitle px-3 mb-2">Tu actividad</p>
          <router-link
            :to="{ name: 'social.trends' }"
            class="soc-nav-link"
            active-class="active"
            @click="closeMenu"
          >
            <Bookmark :size="18" />
            <span>Tendencias</span>
          </router-link>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
