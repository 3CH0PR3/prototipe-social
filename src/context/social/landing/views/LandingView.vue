<script setup>
import { onMounted } from 'vue';

import HeaderLanding from '../components/layout/HeaderLanding.vue';
import FooterLanding from '../components/layout/FooterLanding.vue';
import HeroSection from '../components/sections/HeroSection.vue';
import CitiesMarquee from '../components/sections/CitiesMarquee.vue';
import StatsSection from '../components/sections/StatsSection.vue';
import HowItWorksSection from '../components/sections/HowItWorksSection.vue';
import CitiesSection from '../components/sections/CitiesSection.vue';
import MaterialsSection from '../components/sections/MaterialsSection.vue';
import RecognitionSection from '../components/sections/RecognitionSection.vue';
import TestimonialsSection from '../components/sections/TestimonialsSection.vue';
import CtaSection from '../components/sections/CtaSection.vue';

onMounted(() => {
  const revealElements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));

  const animateCounter = (element) => {
    const target = parseInt(element.dataset.count, 10);
    const suffix = element.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      element.textContent = value.toLocaleString('es-CO') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => counterObserver.observe(el));
});
</script>

<template>
  <div class="landing-container">
    <HeaderLanding />
    <HeroSection />
    <CitiesMarquee />
    <StatsSection />
    <HowItWorksSection />
    <CitiesSection />
    <MaterialsSection />
    <RecognitionSection />
    <TestimonialsSection />
    <CtaSection />
    <FooterLanding />
  </div>
</template>

<style>
@import '@social/assets/styles/modules/landing.css';
</style>
