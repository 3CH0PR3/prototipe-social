<script setup>
import { ref, computed } from 'vue';
import { MapPin, Calendar, Link2, Phone, User } from '@lucide/vue';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';
import InfoField from '@social/pages/profile/views/modules/info/components/InfoField.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  isOwnProfile: { type: Boolean, default: false },
  profileId: { type: [String, Number], default: null }
});

const profileStore = useProfileStore();
const saving = ref(false);
const activeSection = ref('detalles');

// Secciones del sidebar (solo visible si es mi perfil)
const sections = [
  { id: 'detalles', label: 'Detalles' },
  { id: 'nombres', label: 'Datos personales' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'privacidad', label: 'Privacidad' }
];

const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_say', label: 'Prefiero no decir' }
];

const privacyOptions = [
  { value: 'public', label: 'Público — Todos pueden ver mi perfil' },
  { value: 'private', label: 'Privado — Solo mis amigos pueden ver mi perfil' }
];

const pi = computed(() => props.profile?.personal_information || {});

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

// Guardar un campo
const save = async (field, value) => {
  if (!props.profileId) return;
  saving.value = true;
  try {
    await profileStore.saveProfile(props.profileId, { [field]: value });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <!-- Vista editable (mi perfil) -->
  <div v-if="isOwnProfile" class="flex flex-col lg:flex-row gap-4">
    <!-- Sidebar de secciones -->
    <aside class="w-full lg:w-64 shrink-0">
      <div class="soc-card p-2">
        <h2 class="px-3 pt-2 pb-3 text-lg font-bold text-gray-900 dark:text-white"></h2>
        <nav class="flex flex-col gap-0.5">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              activeSection === s.id
                ? 'bg-green-50 text-emerald-600 dark:bg-green-950/30'
                : 'text-gray-600 bg-transparent hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            "
            @click="activeSection = s.id"
          >
            {{ s.label }}
          </button>
        </nav>
      </div>
    </aside>

    <!-- Panel principal -->
    <div class="flex-1 min-w-0">
      <!-- DETALLES -->
      <div v-if="activeSection === 'detalles'" class="soc-card p-6 space-y-0">
        <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">Detalles</h3>

        <InfoField
          label="Biografía"
          type="textarea"
          :value="profile.bio"
          placeholder="Cuéntanos sobre ti…"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('bio', $event)"
        />
        <InfoField
          label=""
          :value="profile.location"
          placeholder="Ciudad, Paás"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('location', $event)"
        />
        <InfoField
          label="Sitio web"
          type="url"
          :value="profile.website_url"
          placeholder="https://ejemplo.com"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('website_url', $event)"
        />

        <!-- Estadásticas -->
        <div class="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-500 mb-3">Estadásticas</h3>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ profile?.friends_count ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Amigos</p>
            </div>
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ profile?.followers_count ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Seguidores</p>
            </div>
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ profile?.posts_count ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Publicaciones</p>
            </div>
          </div>
        </div>
      </div>

      <!-- DATOS PERSONALES -->
      <div v-else-if="activeSection === 'nombres'" class="soc-card p-6">
        <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">Datos personales</h3>

        <InfoField
          label="Primer nombre"
          :value="pi.first_name"
          placeholder="Juan"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('first_name', $event)"
        />
        <InfoField
          label="Segundo nombre"
          :value="pi.second_name"
          placeholder="Carlos"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('second_name', $event)"
        />
        <InfoField
          label="Apellido paterno"
          :value="pi.paternal_surname"
          placeholder="Pérez"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('paternal_surname', $event)"
        />
        <InfoField
          label="Apellido materno"
          :value="pi.maternal_surname"
          placeholder="García"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('maternal_surname', $event)"
        />
        <InfoField
          label="Fecha de nacimiento"
          type="date"
          :value="pi.birth_date"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('birth_date', $event)"
        />
        <InfoField
          label="Género"
          type="select"
          :options="genderOptions"
          :value="pi.gender"
          placeholder="Seleccionar…"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('gender', $event)"
        />
        <InfoField
          label="Cédula de identidad"
          :value="pi.identity_card"
          placeholder="V-12345678"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('identity_card', $event)"
        />
      </div>

      <!-- CONTACTO -->
      <div v-else-if="activeSection === 'contacto'" class="soc-card p-6">
        <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">Contacto</h3>

        <InfoField
          label="Número de teléfono"
          type="tel"
          :value="pi.phone_number"
          placeholder="+58 414-1234567"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('phone_number', $event)"
        />
        <InfoField
          label=""
          :value="profile.location"
          placeholder="Caracas, Venezuela"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('location', $event)"
        />
        <InfoField
          label="Sitio web"
          type="url"
          :value="profile.website_url"
          placeholder="https://ejemplo.com"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('website_url', $event)"
        />
      </div>

      <!-- PRIVACIDAD -->
      <div v-else-if="activeSection === 'privacidad'" class="soc-card p-6">
        <h3 class="text-base font-bold text-gray-900 dark:text-white mb-2">Privacidad</h3>
        <p class="text-sm text-gray-500 mb-4">Elige quién puede ver tu perfil y contenido.</p>

        <InfoField
          label="Visibilidad del perfil"
          type="select"
          :options="privacyOptions"
          :value="profile.privacy_level || 'public'"
          :is-me="isOwnProfile"
          :saving="saving"
          @save="save('privacy_level', $event)"
        />
      </div>
    </div>
  </div>

  <!-- Vista readonly (otros perfiles) -->
  <div v-else class="max-w-2xl space-y-4">
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
