<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const goToLogin = () => {
  router.push({ name: 'social.login' });
};

const goToRegister = () => {
  router.push({ name: 'social.register' });
};
</script>

<template>
  <header class="landing-header">
    <div class="landing-header-content">
      <a href="#top" class="landing-logo-link">
        <img src="@/assets/img/social/logo.png" alt="GEA Social" class="landing-logo-img" />
        <span class="landing-logo-text">GEA Social</span>
      </a>

      <nav class="landing-nav">
        <a href="#como-funciona" class="landing-nav-link">Cómo funciona</a>
        <a href="#ciudades" class="landing-nav-link">Ciudades</a>
        <a href="#materiales" class="landing-nav-link">Materiales</a>
        <a href="#comunidad" class="landing-nav-link">Comunidad</a>
      </nav>

      <div class="landing-header-actions">
        <button @click="goToLogin" class="landing-btn-login">
          Iniciar sesión
        </button>
        <button @click="goToRegister" class="landing-btn-register">
          Unirme gratis
        </button>
      </div>

      <button
        @click="toggleMobileMenu"
        class="landing-mobile-toggle"
        :aria-expanded="mobileMenuOpen"
        aria-label="Abrir menú"
      >
        <svg
          v-if="!mobileMenuOpen"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="landing-mobile-menu">
      <a href="#como-funciona" @click="closeMobileMenu" class="landing-mobile-link">Cómo funciona</a>
      <a href="#ciudades" @click="closeMobileMenu" class="landing-mobile-link">Ciudades</a>
      <a href="#materiales" @click="closeMobileMenu" class="landing-mobile-link">Materiales</a>
      <a href="#comunidad" @click="closeMobileMenu" class="landing-mobile-link">Comunidad</a>
      <div class="landing-mobile-actions">
        <button @click="goToLogin" class="landing-mobile-btn-login">
          Iniciar sesión
        </button>
        <button @click="goToRegister" class="landing-mobile-btn-register">
          Unirme gratis
        </button>
      </div>
    </div>
  </header>
</template>
