<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToRegister = () => {
  router.push({ name: 'social.register' });
};

const scrollToHowItWorks = () => {
  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <section class="landing-hero">
    <div class="landing-hero-content">
      <div class="landing-hero-text">
        <div class="landing-hero-badge">
          <span class="landing-hero-badge-dot"></span>
          <span class="landing-hero-badge-text">Activo en 127 ciudades de Colombia</span>
        </div>
        <h1 class="landing-hero-title">
          La red social
          <span class="landing-hero-title-highlight">del reciclaje</span>
          en Colombia
        </h1>
        <p class="landing-hero-subtitle">
          Conectamos vecinos, recicladores de oficio y organizaciones para que cada material recuperable encuentre su lugar. Sin intermediarios, sin complicaciones.
        </p>
        <div class="landing-hero-actions">
          <button @click="goToRegister" class="landing-btn-cta-primary">
            Unirme gratis
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button @click="scrollToHowItWorks" class="landing-btn-cta-secondary">
            Cómo funciona
          </button>
        </div>
        <div class="landing-hero-stats">
          <div class="landing-hero-stat">
            <p class="landing-hero-stat-value" data-count="8420">0</p>
            <p class="landing-hero-stat-label">usuarios activos</p>
          </div>
          <div class="landing-hero-stat">
            <p class="landing-hero-stat-value" data-count="52">0</p>
            <p class="landing-hero-stat-label">toneladas recuperadas</p>
          </div>
          <div class="landing-hero-stat">
            <p class="landing-hero-stat-value" data-count="612">0</p>
            <p class="landing-hero-stat-label">recicladores verificados</p>
          </div>
        </div>
      </div>
      <div class="landing-hero-visual">
        <div class="landing-hero-collage">
          <div class="landing-collage-main">
            <img src="https://picsum.photos/seed/reciclador-1/600/700" alt="Reciclador" />
          </div>
          <div class="landing-collage-secondary">
            <img src="https://picsum.photos/seed/material-1/300/300" alt="Material reciclable" />
          </div>
          <div class="landing-collage-accent">
            <img src="https://picsum.photos/seed/comunidad-1/250/350" alt="Comunidad" />
          </div>
          <div class="landing-collage-stamp">
            <svg class="w-full h-full" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="55" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
              <text x="60" y="55" text-anchor="middle" class="landing-stamp-text">100%</text>
              <text x="60" y="72" text-anchor="middle" class="landing-stamp-subtext">VERIFICADO</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
