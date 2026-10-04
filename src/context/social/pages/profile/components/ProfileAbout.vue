<script setup>
import { computed } from 'vue';
import { MapPin, Calendar, Globe, Briefcase, GraduationCap, Heart, User } from '@lucide/vue';

const props = defineProps({
  profile: { type: Object, required: true }
});

const personalInfo = computed(() => props.profile.personal_information || {});
const fullName = computed(() => {
  const info = personalInfo.value;
  return (
    [info.first_name, info.paternal_surname, info.maternal_surname].filter(Boolean).join(' ') ||
    props.profile.username
  );
});

const formattedBirthdate = computed(() => {
  if (!props.profile.birthdate) return null;
  const date = new Date(props.profile.birthdate);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const infoSections = computed(() => [
  {
    title: ' general',
    items: [
      {
        icon: User,
        label: 'Nombre completo',
        value: fullName.value,
        show: !!fullName.value
      },
      {
        icon: MapPin,
        label: 'Ubicación',
        value: props.profile.location,
        show: !!props.profile.location
      },
      {
        icon: Calendar,
        label: 'Fecha de nacimiento',
        value: formattedBirthdate.value,
        show: !!formattedBirthdate.value
      },
      {
        icon: Globe,
        label: 'Sitio web',
        value: props.profile.website_url,
        isLink: true,
        show: !!props.profile.website_url
      }
    ].filter((item) => item.show)
  }
]);

const hasBio = computed(() => !!props.profile.bio);
const hasAnyInfo = computed(
  () => hasBio.value || infoSections.value.some((section) => section.items.length > 0)
);
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Información</h2>

    <!-- Empty state -->
    <div v-if="!hasAnyInfo" class="text-center py-12 text-gray-500">
      <User :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold">No hay información disponible</p>
      <p class="text-sm mt-2">Este usuario no ha agregado información personal</p>
    </div>

    <!-- Bio Section -->
    <div v-if="hasBio" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Biografía</h3>
      <p class="text-gray-700 leading-relaxed">{{ profile.bio }}</p>
    </div>

    <!-- Info Sections -->
    <div v-for="section in infoSections" :key="section.title" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ section.title }}
      </h3>

      <div class="space-y-3">
        <div v-for="(item, index) in section.items" :key="index" class="flex items-start gap-3">
          <component :is="item.icon" :size="20" class="text-gray-500 mt-0.5 flex-shrink-0" />

          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-500 mb-0.5">{{ item.label }}</p>

            <a
              v-if="item.isLink"
              :href="item.value"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-600 hover:text-emerald-700 font-medium break-words"
            >
              {{ item.value }}
            </a>

            <p v-else class="text-gray-900 font-medium break-words">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Section (Placeholder for future) -->
    <div class="mb-6 opacity-50">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase :size="20" />
        Trabajo
      </h3>
      <p class="text-sm text-gray-500 ml-7">No se ha agregado  laboral</p>
    </div>

    <!-- Education Section (Placeholder for future) -->
    <div class="mb-6 opacity-50">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <GraduationCap :size="20" />
        
      </h3>
      <p class="text-sm text-gray-500 ml-7">No se ha agregado  educativa</p>
    </div>

    <!-- Relationship Section (Placeholder for future) -->
    <div class="opacity-50">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Heart :size="20" />
        
      </h3>
      <p class="text-sm text-gray-500 ml-7">No se ha especificado estado civil</p>
    </div>
  </div>
</template>
