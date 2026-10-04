<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToRegister = () => {
  router.push({ name: 'social.register' });
};
</script>

<template>
  <section class="landing-section">
    <div class="landing-section-content">
      <div class="landing-cta landing-reveal" data-reveal>
        <h2 class="landing-cta-title">
          Tu próxima bolsa de reciclaje puede cambiar tu barrio
        </h2>
        <p class="landing-cta-text">
          Únete gratis a GEA Social y conecta hoy mismo con tu red de reciclaje local
        </p>
        <button @click="goToRegister" class="landing-cta-button">
          Crear mi cuenta
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
