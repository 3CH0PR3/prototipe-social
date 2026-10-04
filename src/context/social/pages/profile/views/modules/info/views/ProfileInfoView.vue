<script setup>
import { ref, computed } from 'vue';
import { useProfileStore } from '@social/pages/profile/stores/useProfile.store.js';
import InfoField from '../components/InfoField.vue';

const props = defineProps({
  person: { type: Object, default: () => ({}) },
  isMe: { type: Boolean, default: false },
  personId: { type: String, default: null }
});

const store = useProfileStore();
const saving = ref(false);
const activeSection = ref('detalles');

// ── Secciones del sidebar ──────────────────────────────────────────────────
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

// Helpers para leer datos del perfil
const pi = computed(() => props.person?.personal_information || {});

// ── Guardar un campo ───────────────────────────────────────────────────────
const save = async (field, value) => {
  if (!props.personId) return;
  saving.value = true;
  try {
    await store.saveProfile(props.personId, { [field]: value });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4">
    <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
    <aside class="w-full lg:w-64 shrink-0">
      <div class="soc-card p-2">
        <h2 class="px-3 pt-2 pb-3 text-lg font-bold text-text-primary"></h2>
        <nav class="flex flex-col gap-0.5">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border-0 cursor-pointer"
            :class="
              activeSection === s.id
                ? 'bg-green-50 text-brand dark:bg-green-950/30'
                : 'text-text-secondary bg-transparent hover:bg-surface-alt'
            "
            @click="activeSection = s.id"
          >
            {{ s.label }}
          </button>
        </nav>
      </div>
    </aside>

    <!-- ── Panel principal ─────────────────────────────────────────────── -->
    <div class="flex-1 min-w-0">
      <!-- DETALLES ────────────────────────────────────────────────────── -->
      <div v-if="activeSection === 'detalles'" class="soc-card p-6 space-y-0">
        <h3 class="text-base font-bold text-text-primary mb-2">Detalles</h3>

        <InfoField
          label="Biografía"
          type="textarea"
          :value="person.bio"
          placeholder="Cuéntanos sobre ti…"
          :is-me="isMe"
          :saving="saving"
          @save="save('bio', $event)"
        />
        <InfoField
          label="Ciudad, País"
          :value="person.location"
          placeholder="Ciudad, País"
          :is-me="isMe"
          :saving="saving"
          @save="save('location', $event)"
        />
        <InfoField
          label="Sitio web"
          type="url"
          :value="person.website_url"
          placeholder="https://ejemplo.com"
          :is-me="isMe"
          :saving="saving"
          @save="save('website_url', $event)"
        />

        <!-- Estadísticas -->
        <div class="pt-4 mt-2 border-t border-border">
          <h3 class="text-sm font-semibold text-text-secondary mb-3">Estadísticas</h3>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="rounded-lg bg-surface-alt p-3">
              <p class="text-xl font-bold text-text-primary">
                {{ person?.friends_count ?? 0 }}
              </p>
              <p class="text-xs text-text-muted mt-0.5">Amigos</p>
            </div>
            <div class="rounded-lg bg-surface-alt p-3">
              <p class="text-xl font-bold text-text-primary">
                {{ person?.followers_count ?? 0 }}
              </p>
              <p class="text-xs text-text-muted mt-0.5">Seguidores</p>
            </div>
            <div class="rounded-lg bg-surface-alt p-3">
              <p class="text-xl font-bold text-text-primary">
                {{ person?.posts_count ?? 0 }}
              </p>
              <p class="text-xs text-text-muted mt-0.5">Publicaciones</p>
            </div>
          </div>
        </div>
      </div>

      <!-- DATOS PERSONALES ────────────────────────────────────────────── -->
      <div v-else-if="activeSection === 'nombres'" class="soc-card p-6">
        <h3 class="text-base font-bold text-text-primary mb-2">Datos personales</h3>

        <InfoField
          label="Primer nombre"
          :value="pi.first_name"
          placeholder="Juan"
          :is-me="isMe"
          :saving="saving"
          @save="save('first_name', $event)"
        />
        <InfoField
          label="Segundo nombre"
          :value="pi.second_name"
          placeholder="Carlos"
          :is-me="isMe"
          :saving="saving"
          @save="save('second_name', $event)"
        />
        <InfoField
          label="Apellido paterno"
          :value="pi.paternal_surname"
          placeholder="Pérez"
          :is-me="isMe"
          :saving="saving"
          @save="save('paternal_surname', $event)"
        />
        <InfoField
          label="Apellido materno"
          :value="pi.maternal_surname"
          placeholder="García"
          :is-me="isMe"
          :saving="saving"
          @save="save('maternal_surname', $event)"
        />
        <InfoField
          label="Fecha de nacimiento"
          type="date"
          :value="pi.birth_date"
          :is-me="isMe"
          :saving="saving"
          @save="save('birth_date', $event)"
        />
        <InfoField
          label="Género"
          type="select"
          :options="genderOptions"
          :value="pi.gender"
          placeholder="Seleccionar…"
          :is-me="isMe"
          :saving="saving"
          @save="save('gender', $event)"
        />
        <InfoField
          label="Cédula de identidad"
          :value="pi.identity_card"
          placeholder="V-12345678"
          :is-me="isMe"
          :saving="saving"
          @save="save('identity_card', $event)"
        />
      </div>

      <!-- CONTACTO ────────────────────────────────────────────────────── -->
      <div v-else-if="activeSection === 'contacto'" class="soc-card p-6">
        <h3 class="text-base font-bold text-text-primary mb-2">Contacto</h3>

        <InfoField
          label="Número de teléfono"
          type="tel"
          :value="pi.phone_number"
          placeholder="+58 414-1234567"
          :is-me="isMe"
          :saving="saving"
          @save="save('phone_number', $event)"
        />
        <InfoField
          label=""
          :value="person.location"
          placeholder="Caracas, Venezuela"
          :is-me="isMe"
          :saving="saving"
          @save="save('location', $event)"
        />
        <InfoField
          label="Sitio web"
          type="url"
          :value="person.website_url"
          placeholder="https://ejemplo.com"
          :is-me="isMe"
          :saving="saving"
          @save="save('website_url', $event)"
        />
      </div>

      <!-- PRIVACIDAD ──────────────────────────────────────────────────── -->
      <div v-else-if="activeSection === 'privacidad'" class="soc-card p-6">
        <h3 class="text-base font-bold text-text-primary mb-2">Privacidad</h3>
        <p class="text-sm text-text-muted mb-4">Elige quién puede ver tu perfil y contenido.</p>

        <InfoField
          label="Visibilidad del perfil"
          type="select"
          :options="privacyOptions"
          :value="person.privacy_level || 'public'"
          :is-me="isMe"
          :saving="saving"
          @save="save('privacy_level', $event)"
        />
      </div>
    </div>
  </div>
</template>
