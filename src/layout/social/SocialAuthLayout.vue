<script setup>
import { Leaf, Users, ShieldCheck, Zap, Sun, Moon } from '@lucide/vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useSocialThemeStore } from '../../stores/useSocialTheme.store';
import ImageAuth from '@img/social/auth_social.webp';
import '@/contexts/social/assets/social.css';

const themeStore = useSocialThemeStore();
const isOnline = ref(navigator.onLine);

const updateStatus = () => {
  isOnline.value = navigator.onLine;
  console.log('Estado cambiado:', isOnline.value);
};

onMounted(() => {
  document.documentElement.classList.add('theme-social');
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
});

onBeforeUnmount(() => {
  document.documentElement.classList.remove('theme-social');
  window.removeEventListener('online', updateStatus);
  window.removeEventListener('offline', updateStatus);
});
</script>

<template>
  <div class="theme-social soc-auth-layout" :class="{ dark: themeStore.isDark }">
    <!-- Theme Toggle -->
    <button
      @click="themeStore.toggleWithTransition($event)"
      type="button"
      class="soc-auth-theme-toggle"
      :aria-label="themeStore.isDark ? 'Modo claro' : 'Modo oscuro'"
    >
      <Sun v-if="themeStore.isDark" class="h-5 w-5" />
      <Moon v-else class="h-5 w-5" />
    </button>

    <!-- Panel Izquierdo: Formularios (Clean & Themed) -->
    <div class="soc-auth-left-panel">
      <div class="conecta-post" data-id="post_1">
  <p><strong>Elena Rostova</strong>: "Comenzando el fin de semana en este refugio de montaña. No hay nada como el aire..."</p>
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" alt="Post media" />
  <a href="https://ais-dev-3keqpjlz6kuzx4cthyhdsf-264598469263.us-east1.run.app/#/feeds">Ver en Conecta Radar</a>
</div>
      <div class="soc-auth-container">
        <!-- Brand / Logo (Sharp & Minimalist) -->
        <!-- <div class="flex items-center gap-3 mb-10">
          <div class="flex h-10 w-10 items-center justify-center bg-brand-500 text-white rounded-md">
            <Leaf class="h-5 w-5" />
          </div>
          <span class="text-2xl font-bold tracking-tight text-text-primary">GEA-Social</span>
        </div> -->

        <!-- Router View -->
        <router-view />
      </div>
    </div>

    <!-- Panel Derecho: Imagen Full Screen sin bordes ni fondos extra -->
    <div class="soc-auth-right-panel">
      <img :src="ImageAuth" alt="Nature and Recycling" class="soc-auth-image" />
      <!-- Gradiente muy sutil solo para que el texto resalte -->
      <div class="soc-auth-gradient"></div>

      <!-- Texto flotando sobre la imagen directamente (sin cajas) -->
      <div class="soc-auth-hero">
        <h2 class="soc-auth-hero-title">
          El cambio
          <br />
          comienza
          <span class="soc-auth-hero-highlight">contigo.</span>
        </h2>
        <p class="soc-auth-hero-subtitle">
          Únete a la primera red social de reciclaje en Colombia. Conecta con miles de personas, comparte tu impacto y
          recibe recompensas por cuidar nuestro planeta.
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
