<script setup>
const steps = [
  {
    number: 1,
    title: 'Publica tu material',
    description: 'Sube una foto del material reciclable que tienes y añade ubicación'
  },
  {
    number: 2,
    title: 'Los recicladores reciben',
    description: 'Recicladores verificados en tu zona ven tu publicación y coordinan'
  },
  {
    number: 3,
    title: 'Se retira el material',
    description: 'Un reciclador pasa por tu dirección y recoge el material'
  },
  {
    number: 4,
    title: 'Ganas EcoPuntos',
    description: 'Acumulas puntos canjeables en comercios aliados'
  }
];
</script>

<template>
  <section id="como-funciona" class="landing-section-dark">
    <div class="landing-section-content">
      <div class="max-w-2xl mx-auto text-center mb-16 landing-reveal" data-reveal>
        <h2 class="text-4xl font-bold mb-4">Cómo funciona</h2>
        <p class="text-lg text-gray-300">Cuatro pasos simples para reciclar desde casa</p>
      </div>
      <div class="landing-steps-grid">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          class="landing-step-card landing-reveal"
          data-reveal
          :style="{ transitionDelay: `${index * 0.1}s` }"
        >
          <div class="landing-step-number">{{ step.number }}</div>
          <h3 class="landing-step-title">{{ step.title }}</h3>
          <p class="landing-step-text">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
