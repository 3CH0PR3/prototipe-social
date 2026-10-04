<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import '@/contexts/social/assets/social.css';

import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useEchoSocial } from '@social/shared/composables/useEchoSocial.js';

import SocialNavbar from './components/SocialNavbar.vue';
import SocialSidebarLeft from './components/SocialSidebarLeft.vue';
import SocialSidebarRight from './components/SocialSidebarRight.vue';
import SocialMobileMenu from './components/SocialMobileMenu.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// Inicializar WebSockets para toda la red social
useEchoSocial();

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

let wasDarkTheme = false;

onMounted(() => {
  document.documentElement.classList.add('theme-social');

  // Como el feed aún no maneja dark mode, forzamos light mode removiendo la clase
  if (document.documentElement.classList.contains('dark')) {
    wasDarkTheme = true;
    document.documentElement.classList.remove('dark');
  }
});

onBeforeUnmount(() => {
  document.documentElement.classList.remove('theme-social');

  // Restauramos el modo oscuro si el usuario lo tenía activo al salir
  if (wasDarkTheme) {
    document.documentElement.classList.add('dark');
  }
});
</script>

<template>
  <div class="soc-layout theme-social">
    <!-- Navbar Component -->
    <SocialNavbar
      :user="user"
      :is-mobile-menu-open="isMobileMenuOpen"
      @toggle-mobile-menu="toggleMobileMenu"
    />

    <!-- Offcanvas Mobile Menu Component -->
    <SocialMobileMenu :is-open="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <!-- Main Content Grid -->
    <main :class="route.meta.fullWidth ? 'w-full' : 'soc-main-grid'">
      <!-- Left Sidebar Component -->
      <SocialSidebarLeft v-if="!route.meta.fullWidth" />

      <!-- Center Content (Router View) -->
      <section :class="route.meta.fullWidth ? 'w-full' : 'soc-feed'">
        <router-view />
      </section>

      <!-- Right Sidebar Component -->
      <SocialSidebarRight v-if="!route.meta.fullWidth" />
    </main>
  </div>
</template>
