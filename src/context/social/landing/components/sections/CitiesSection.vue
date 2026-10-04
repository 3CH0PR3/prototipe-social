<script setup>
const cities = [
  { name: 'Bogotá D.C.', stat: '2.4k usuarios', img: 'bogota' },
  { name: 'Medellín', stat: '1.8k usuarios', img: 'medellin' },
  { name: 'Cali', stat: '1.2k usuarios', img: 'cali' },
  { name: 'Barranquilla', stat: '890 usuarios', img: 'barranquilla' },
  { name: 'Cartagena', stat: '650 usuarios', img: 'cartagena' },
  { name: 'Bucaramanga', stat: '580 usuarios', img: 'bucaramanga' }
];
</script>

<template>
  <section id="ciudades" class="landing-section">
    <div class="landing-section-content">
      <div class="max-w-2xl mx-auto text-center mb-16 landing-reveal" data-reveal>
        <h2 class="text-4xl font-bold mb-4">Activos en toda Colombia</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">Red presente en las principales ciudades del país</p>
      </div>
      <div class="landing-cities-grid">
        <div
          v-for="(city, index) in cities"
          :key="city.name"
          class="landing-city-card landing-reveal"
          data-reveal
          :style="{ transitionDelay: `${index * 0.08}s` }"
        >
          <img
            :src="`https://picsum.photos/seed/${city.img}/600/400`"
            :alt="city.name"
            class="landing-city-img"
          />
          <div class="landing-city-overlay"></div>
          <div class="landing-city-content">
            <h3 class="landing-city-name">{{ city.name }}</h3>
            <p class="landing-city-stat">{{ city.stat }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
