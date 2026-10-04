<script setup>
import { computed } from 'vue';
import { useLegalAcceptance } from '@/shared/composables/useLegalAcceptance';
import PrimaryButton from '@js/Components/Buttons/PrimaryButton.vue';

const { accepted, accept } = useLegalAcceptance('cookies');
const hasConsent = computed(() => !!accepted.value);

function acceptCookies() {
  const version = '1.0';
  accept(version);
}
</script>

<template>
  <div v-if="!hasConsent" class="cookie-banner-wrapper">
    <div class="cookie-banner">
      <div class="cookie-content">
        <h4>Uso de Cookies</h4>
        <p>
          Utilizamos cookies propias y de terceros para fines analíticos y para mostrarte publicidad
          personalizada en base a un perfil elaborado a partir de tus hábitos de navegación.
          <router-link :to="{ name: 'legal.cookies' }" class="cookie-link">Más información</router-link>
        </p>
      </div>
      <div class="cookie-actions">
        <PrimaryButton @click="acceptCookies" class="accept-btn">Aceptar todas</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner-wrapper {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.cookie-banner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  pointer-events: auto;
}

.cookie-content h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.cookie-content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #4a4a4a;
}

.cookie-link {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
}

.cookie-link:hover {
  color: #1d4ed8;
}

.cookie-actions {
  display: flex;
  justify-content: flex-end;
}

.accept-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accept-btn:hover {
  background: #1d4ed8;
}

@media (min-width: 640px) {
  .cookie-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .cookie-content {
    flex: 1;
    padding-right: 2rem;
  }
}
</style>
