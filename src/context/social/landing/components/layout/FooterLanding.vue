<script setup>
import { ref } from 'vue';

const newsletterEmail = ref('');
const newsletterSuccess = ref(false);

const handleNewsletter = (e) => {
  e.preventDefault();
  newsletterSuccess.value = true;
  newsletterEmail.value = '';
  setTimeout(() => {
    newsletterSuccess.value = false;
  }, 5000);
};
</script>

<template>
  <footer class="landing-footer">
    <div class="landing-footer-content">
      <div class="landing-footer-brand">
        <div class="landing-footer-logo">
          <img src="@/assets/img/social/logo.png" alt="GEA Social" class="landing-footer-logo-img" />
          <span class="landing-footer-logo-text">GEA Social</span>
        </div>
        <p class="landing-footer-desc">
          La red social del reciclaje en Colombia. Hecha con y para vecinos, recicladores de oficio y organizaciones.
        </p>
        <form @submit="handleNewsletter" class="landing-footer-newsletter">
          <input
            v-model="newsletterEmail"
            type="email"
            required
            placeholder="tu@correo.com"
            class="landing-footer-input"
          />
          <button type="submit" class="landing-footer-submit">
            Suscribir
          </button>
        </form>
        <p v-if="newsletterSuccess" class="landing-footer-success">
          Gracias. Revisa tu correo para confirmar.
        </p>
      </div>

      <div>
        <p class="landing-footer-section-title">Plataforma</p>
        <ul class="landing-footer-links">
          <li><a href="#como-funciona" class="landing-footer-link">Cómo funciona</a></li>
          <li><a href="#materiales" class="landing-footer-link">Materiales</a></li>
          <li><a href="#" class="landing-footer-link">Iniciar sesión</a></li>
        </ul>
      </div>
      
      <div>
        <p class="landing-footer-section-title">Ciudades</p>
        <ul class="landing-footer-links">
          <li>Bogotá D.C.</li>
          <li>Medellín</li>
          <li>Cali</li>
          <li>Barranquilla</li>
        </ul>
      </div>
      
      <div>
        <p class="landing-footer-section-title">Legal</p>
        <ul class="landing-footer-links">
          <li><a href="#" class="landing-footer-link">Términos de uso</a></li>
          <li><a href="#" class="landing-footer-link">Privacidad</a></li>
          <li><a href="#" class="landing-footer-link">Cookies</a></li>
        </ul>
      </div>
    </div>
    
    <div class="landing-footer-bottom">
      <p>2026 GEA Social. Hecho en Colombia</p>
      <p>Ciclo cerrado</p>
    </div>
  </footer>
</template>
