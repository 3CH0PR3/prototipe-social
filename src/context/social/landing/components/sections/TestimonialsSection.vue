<script setup>
const testimonials = [
  {
    quote: 'Llevo 14 años reciclando en Bosa. Con GEA Social la gente ya sabe cuándo paso y separa mejor el material.',
    name: 'Rosa Martínez',
    role: 'Recicladora de oficio',
    location: 'Bogotá',
    avatar: 51
  },
  {
    quote: 'Publico el cartón de la tienda dos veces por semana y en minutos ya tengo quién lo recoja.',
    name: 'Andrés Gómez',
    role: 'Comerciante',
    location: 'Medellín',
    avatar: 32
  },
  {
    quote: 'Canjeé mis EcoPuntos por un mercado en la tienda aliada del barrio. Reciclar por fin se siente útil.',
    name: 'Camila Restrepo',
    role: 'Vecina',
    location: 'Cali',
    avatar: 47
  }
];
</script>

<template>
  <section id="comunidad" class="landing-section-dark">
    <div class="landing-section-content">
      <div class="max-w-2xl mx-auto text-center mb-16 landing-reveal" data-reveal>
        <h2 class="text-4xl font-bold mb-4">Lo que dice la comunidad</h2>
        <p class="text-lg text-gray-300">Voces reales de la red de reciclaje</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.name"
          class="landing-testimonial landing-reveal"
          data-reveal
          :style="{ transitionDelay: `${index * 0.1}s` }"
        >
          <p class="landing-testimonial-quote">{{ testimonial.quote }}</p>
          <div class="landing-testimonial-author">
            <img
              :src="`https://i.pravatar.cc/80?img=${testimonial.avatar}`"
              :alt="testimonial.name"
              class="landing-testimonial-avatar"
            />
            <div>
              <p class="landing-testimonial-name">{{ testimonial.name }}</p>
              <p class="landing-testimonial-role">{{ testimonial.role }} · {{ testimonial.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
