<script setup>
const stats = [
  { number: 127, label: 'Ciudades activas', suffix: '+' },
  { number: 8420, label: 'Usuarios conectados', suffix: '+' },
  { number: 52, label: 'Toneladas recuperadas', suffix: 'k+' },
  { number: 612, label: 'Recicladores verificados', suffix: '' }
];
</script>

<template>
  <section class="landing-section">
    <div class="landing-section-content">
      <div class="landing-stats-grid">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="landing-stat-item landing-reveal"
          data-reveal
          :style="{ transitionDelay: `${index * 0.1}s` }"
        >
          <p class="landing-stat-number" :data-count="stat.number" :data-suffix="stat.suffix">0{{ stat.suffix }}</p>
          <p class="landing-stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
