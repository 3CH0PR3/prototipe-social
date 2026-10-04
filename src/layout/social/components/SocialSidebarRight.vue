<script setup>
import { useRouter } from 'vue-router';
import { Leaf, Globe2 } from '@lucide/vue';

const router = useRouter();
const go = (name) => router.push({ name });
</script>

<template>
  <aside class="soc-sidebar-right">
    <nav class="soc-sidebar-nav !mb-0">
      <div class="soc-subtitle">
        <p class="soc-subtitle">Empresas destacadas</p>
      </div>
    </nav>

    <div class="soc-card soc-widget">
      <div v-if="false" class="soc-widget-title">
        <span class="soc-title text-base"></span>
        <button class="soc-btn-secondary" @click="go('social.explore')">Ver todas</button>
      </div>

      <div class="soc-widget-item">
        <div class="soc-widget-icon bg-green-50 text-green-600">
          <Leaf :size="16" />
        </div>
        <div class="soc-widget-content">
          <p class="soc-widget-text-title">Recicla tu barrio</p>
          <p class="soc-text-xs mt-0.5">12.4k personas participan</p>
          <button class="soc-btn-outline mt-2" @click="go('social.groups')">Unirme al grupo</button>
        </div>
      </div>

      <div class="soc-widget-item">
        <div class="soc-widget-icon bg-blue-50 text-blue-600">
          <Globe2 :size="16" />
        </div>
        <div class="soc-widget-content">
          <p class="soc-widget-text-title">Guardianes del agua</p>
          <p class="soc-text-xs mt-0.5">Red nacional · 4.8k miembros</p>
          <button class="soc-btn-outline mt-2" @click="go('social.groups')">Conocer iniciativa</button>
        </div>
      </div>
    </div>

    <!-- Lo que está pasando -->
    <div class="soc-widget mb-4">
      <div v-if="false" class="soc-widget-title">
        <span class="soc-title text-base">Lo que está pasando</span>
        <button class="soc-btn-secondary" @click="go('social.trends')">Explorar</button>
      </div>

      <div class="soc-trend-item" @click="go('social.trends')">
        <p class="soc-trend-title">#ReciclaColombia</p>
        <p class="soc-text-xs mt-0.5">8.2 mil publicaciones</p>
      </div>

      <div class="soc-trend-item" @click="go('social.trends')">
        <p class="soc-trend-title">#EconomíaCircular</p>
        <p class="soc-text-xs mt-0.5">3.6 mil publicaciones</p>
      </div>

      <div class="soc-trend-item" @click="go('social.trends')">
        <p class="soc-trend-title">#GuardianesDelPlaneta</p>
        <p class="soc-text-xs mt-0.5">2.1 mil publicaciones</p>
      </div>
    </div>

    <div class="soc-footer-text">
      GEA-social · Comunidad por Colombia
      <br />
      Privacidad · Ayuda · Términos
    </div>
  </aside>
</template>
