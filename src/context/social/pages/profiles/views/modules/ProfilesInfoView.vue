<script setup>
import { computed } from 'vue';
import { MapPin, Calendar, Link2, Phone, User } from '@lucide/vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  profileId: { type: String, default: null }
});

const pi = computed(() => props.profile.personal_information || {});

const fullName = computed(
  () =>
    [pi.value.first_name, pi.value.second_name, pi.value.paternal_surname, pi.value.maternal_surname]
      .filter(Boolean)
      .join(' ') ||
    props.profile.name ||
    '—'
);

const birthDate = computed(() => {
  const d = pi.value.birth_date || props.profile.birthdate;
  if (!d) return null;
  const [y, m, day] = d.split('-').map(Number);
  if (!y) return d;
  return new Date(y, m - 1, day).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const genderLabel = computed(() => {
  const map = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    prefer_not_say: 'Prefiero no decir'
  };
  return map[pi.value.gender] || null;
});
</script>

<template>
  <div class="max-w-2xl space-y-4">
    <!--  personal -->
    <div class="soc-card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4"></h2>

      <p
        v-if="profile.bio"
        class="text-gray-700 dark:text-gray-300 leading-relaxed pb-4 mb-4 border-b border-gray-100 dark:border-gray-800"
      >
        {{ profile.bio }}
      </p>

      <dl class="space-y-3">
        <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <User class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ fullName }}</span>
        </div>

        <div v-if="profile.location" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <MapPin class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ profile.location }}</span>
        </div>

        <div v-if="birthDate" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ birthDate }}</span>
        </div>

        <div v-if="pi.phone_number" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Phone class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ pi.phone_number }}</span>
        </div>

        <div v-if="profile.website_url" class="flex items-center gap-3 text-sm">
          <Link2 class="w-4 h-4 text-gray-400 shrink-0" />
          <a
            :href="profile.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-emerald-600 hover:underline truncate"
          >
            {{ profile.website_url }}
          </a>
        </div>

        <div v-if="genderLabel" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span class="w-4 h-4 text-gray-400 shrink-0 text-center text-xs">♂♀</span>
          <span>{{ genderLabel }}</span>
        </div>
      </dl>

      <!-- Estado vacío -->
      <p
        v-if="!profile.bio && !profile.location && !birthDate && !pi.phone_number && !profile.website_url"
        class="text-sm text-gray-400 italic"
      >
        Este usuario no ha agregado .
      </p>
    </div>

    <!-- Estadásticas -->
    <div class="soc-card p-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Estadásticas</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ profile.friends_count ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Amigos</p>
        </div>
        <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ profile.followers_count ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Seguidores</p>
        </div>
        <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ profile.posts_count ?? 0 }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Publicaciones</p>
        </div>
      </div>
    </div>
  </div>
</template>
