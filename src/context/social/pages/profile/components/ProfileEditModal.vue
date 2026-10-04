<script setup>
import { ref, watch, computed } from 'vue';
import { Lock, Globe } from '@lucide/vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';
import { profileService } from '../services/profile.service';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  profile: { type: Object, required: true }
});

const emit = defineEmits(['close', 'updated']);

const isSaving = ref(false);
const errorMsg = ref('');
const activeSection = ref('personal');

const form = ref({
  first_name: '',
  second_name: '',
  paternal_surname: '',
  maternal_surname: '',
  identity_card: '',
  birth_date: '',
  gender: '',
  phone_number: '',
  bio: '',
  location: '',
  website_url: '',
  privacy_level: 'public'
});

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    const pi = props.profile?.personal_information || {};
    form.value = {
      first_name: pi.first_name || '',
      second_name: pi.second_name || '',
      paternal_surname: pi.paternal_surname || '',
      maternal_surname: pi.maternal_surname || '',
      identity_card: pi.identity_card || '',
      birth_date: pi.birth_date || '',
      gender: pi.gender || '',
      phone_number: pi.phone_number || '',
      bio: props.profile.bio || '',
      location: props.profile.location || '',
      website_url: props.profile.website_url || '',
      privacy_level: props.profile.privacy_level || 'public'
    };
    errorMsg.value = '';
    activeSection.value = 'personal';
  }
);

const fullName = computed(
  () =>
    [form.value.first_name, form.value.second_name, form.value.paternal_surname, form.value.maternal_surname]
      .filter(Boolean)
      .join(' ') || '—'
);

const sections = [
  { id: 'personal', label: 'Nombre y datos' },
  { id: 'contact', label: 'Contacto' },
  { id: 'profile', label: 'Perfil público' },
  { id: 'privacy', label: 'Privacidad' }
];

const genders = [
  { value: '', label: 'Seleccionar...' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_say', label: 'Prefiero no decir' }
];

const save = async () => {
  if (!form.value.first_name.trim()) {
    errorMsg.value = 'El primer nombre es obligatorio';
    return;
  }
  if (!form.value.paternal_surname.trim()) {
    errorMsg.value = 'El apellido paterno es obligatorio';
    return;
  }

  try {
    isSaving.value = true;
    errorMsg.value = '';
    // profile.id == social_user_id, el backend busca por social_user_id en social_user_profiles
    await profileService.updateProfile(props.profile.id, form.value);
    emit('updated');
    emit('close');
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al guardar los cambios';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <SocialModal
    title="Editar perfil"
    :is-open="isOpen"
    size="modal-lg"
    :scrollable="true"
    body-class="soc-modal-body-padded"
    @close="$emit('close')"
  >
    <!-- Error -->
    <div v-if="errorMsg" class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Pestañas de  -->
    <div class="flex gap-0 mb-6 border-b border-border">
      <button
        v-for="s in sections"
        :key="s.id"
        type="button"
        class="px-4 py-2.5 text-sm font-medium border-0 bg-transparent cursor-pointer transition-colors relative"
        :class="
          activeSection === s.id ? 'text-brand font-semibold' : 'text-text-muted hover:text-text-secondary'
        "
        @click="activeSection = s.id"
      >
        {{ s.label }}
        <span
          v-if="activeSection === s.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t"
        />
      </button>
    </div>

    <!-- ── SECCIÓN: Nombre y datos ── -->
    <div v-show="activeSection === 'personal'" class="space-y-4">
      <div class="soc-form-grid">
        <div class="soc-form-group">
          <label class="soc-label">
            Primer nombre
            <span class="text-red-500">*</span>
          </label>
          <input v-model="form.first_name" type="text" class="soc-input" placeholder="Juan" />
        </div>
        <div class="soc-form-group">
          <label class="soc-label">Segundo nombre</label>
          <input v-model="form.second_name" type="text" class="soc-input" placeholder="Carlos" />
        </div>
        <div class="soc-form-group">
          <label class="soc-label">
            Apellido paterno
            <span class="text-red-500">*</span>
          </label>
          <input v-model="form.paternal_surname" type="text" class="soc-input" placeholder="Pérez" />
        </div>
        <div class="soc-form-group">
          <label class="soc-label">Apellido materno</label>
          <input v-model="form.maternal_surname" type="text" class="soc-input" placeholder="García" />
        </div>
      </div>

      <!-- Preview nombre completo -->
      <div class="px-3 py-2 bg-surface-alt rounded-lg text-sm text-text-secondary border border-border">
        Nombre completo:
        <strong class="text-text-primary">{{ fullName }}</strong>
      </div>

      <div class="soc-form-grid">
        <div class="soc-form-group">
          <label class="soc-label">Fecha de nacimiento</label>
          <input v-model="form.birth_date" type="date" class="soc-input" />
        </div>
        <div class="soc-form-group">
          <label class="soc-label">Género</label>
          <div class="relative">
            <select v-model="form.gender" class="soc-select pr-8">
              <option v-for="g in genders" :key="g.value" :value="g.value">
                {{ g.label }}
              </option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              ▾
            </span>
          </div>
        </div>
      </div>

      <div class="soc-form-group">
        <label class="soc-label">Cédula de identidad</label>
        <input v-model="form.identity_card" type="text" class="soc-input" placeholder="V-12345678" />
      </div>
    </div>

    <!-- ── SECCIÓN: Contacto ── -->
    <div v-show="activeSection === 'contact'" class="space-y-4">
      <div class="soc-form-group">
        <label class="soc-label">Número de teléfono</label>
        <input v-model="form.phone_number" type="tel" class="soc-input" placeholder="+58 414-1234567" />
      </div>
      <div class="soc-form-group">
        <label class="soc-label"></label>
        <input v-model="form.location" type="text" class="soc-input" placeholder="Caracas, Venezuela" />
      </div>
      <div class="soc-form-group">
        <label class="soc-label">Sitio web</label>
        <input v-model="form.website_url" type="url" class="soc-input" placeholder="https://ejemplo.com" />
      </div>
    </div>

    <!-- ── SECCIÓN: Perfil público ── -->
    <div v-show="activeSection === 'profile'" class="space-y-4">
      <div class="soc-form-group">
        <label class="soc-label">Biografía</label>
        <textarea
          v-model="form.bio"
          rows="5"
          maxlength="500"
          class="soc-textarea"
          placeholder="Cuéntanos sobre ti..."
        ></textarea>
        <p class="soc-input-hint text-right">{{ form.bio.length }}/500</p>
      </div>
    </div>

    <!-- ── SECCIÓN: Privacidad ── -->
    <div v-show="activeSection === 'privacy'" class="space-y-3">
      <p class="text-sm text-text-secondary mb-4">
        Elige quién puede ver tu perfil, publicaciones y lista de amigos.
      </p>

      <label
        class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
        :class="
          form.privacy_level === 'public'
            ? 'border-brand bg-green-50 dark:bg-green-950/20'
            : 'border-border hover:border-border-strong'
        "
      >
        <input v-model="form.privacy_level" type="radio" value="public" class="mt-0.5 accent-brand" />
        <div>
          <div class="flex items-center gap-2 font-semibold text-text-primary mb-1">
            <Globe :size="18" class="text-brand" />
            Público
          </div>
          <p class="text-sm text-text-muted">Cualquier persona puede ver tu perfil y contenido</p>
        </div>
      </label>

      <label
        class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
        :class="
          form.privacy_level === 'private'
            ? 'border-brand bg-green-50 dark:bg-green-950/20'
            : 'border-border hover:border-border-strong'
        "
      >
        <input v-model="form.privacy_level" type="radio" value="private" class="mt-0.5 accent-brand" />
        <div>
          <div class="flex items-center gap-2 font-semibold text-text-primary mb-1">
            <Lock :size="18" class="text-brand" />
            Privado
          </div>
          <p class="text-sm text-text-muted">Solo tus amigos pueden ver tu perfil y contenido</p>
        </div>
      </label>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-3 py-4">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-text-secondary bg-surface-alt hover:bg-border rounded-lg border-0 cursor-pointer transition-colors"
          :disabled="isSaving"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-6 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSaving"
          @click="save"
        >
          {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </template>
  </SocialModal>
</template>
