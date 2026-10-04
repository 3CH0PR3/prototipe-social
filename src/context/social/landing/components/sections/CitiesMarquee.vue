<script setup>
const cities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta',
  'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto', 'Manizales'
];
</script>

<template>
  <div class="landing-marquee">
    <div class="landing-marquee-track">
      <span v-for="city in cities" :key="city" class="landing-marquee-item">
        {{ city }}
      </span>
      <span v-for="city in cities" :key="`${city}-dup`" class="landing-marquee-item">
        {{ city }}
      </span>
    </div>
  </div>
</template>
