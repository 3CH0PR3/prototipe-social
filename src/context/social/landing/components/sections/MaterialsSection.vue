<script setup>
const materials = [
  { name: 'Papel y cartón', icon: '📦', desc: 'Cajas, periódico, cuadernos' },
  { name: 'Plástico', icon: '♻️', desc: 'Botellas PET, envases' },
  { name: 'Vidrio', icon: '🍶', desc: 'Botellas y frascos' },
  { name: 'Metal', icon: '🔧', desc: 'Latas de aluminio' },
  { name: 'Electrónicos', icon: '💻', desc: 'Dispositivos y cables' },
  { name: 'Textiles', icon: '👕', desc: 'Ropa y telas' },
  { name: 'Tetra Pak', icon: '📦', desc: 'Empaques de leche y jugos' },
  { name: 'Baterías', icon: '🔋', desc: 'Pilas y baterías' }
];
</script>

<template>
  <section id="materiales" class="landing-section-light">
    <div class="landing-section-content">
      <div class="max-w-2xl mx-auto text-center mb-16 landing-reveal" data-reveal>
        <h2 class="text-4xl font-bold mb-4">Materiales que recuperamos</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">Todo tipo de reciclables tienen su lugar en la red</p>
      </div>
      <div class="landing-materials-grid">
        <div
          v-for="(material, index) in materials"
          :key="material.name"
          class="landing-material-card landing-reveal"
          data-reveal
          :style="{ transitionDelay: `${index * 0.08}s` }"
        >
          <div class="landing-material-icon">{{ material.icon }}</div>
          <h3 class="landing-material-name">{{ material.name }}</h3>
          <p class="landing-material-desc">{{ material.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
