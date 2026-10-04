<script setup>
import { ref, computed, watch } from 'vue';
import { Lock, Globe } from '@lucide/vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';
import { profileService } from '../services/profile.service';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  profile: { type: Object, required: true }
});

const emit = defineEmits(['close', 'updated']);

// Form data
const formData = ref({
  // Personal Information
  first_name: '',
  second_name: '',
  paternal_surname: '',
  maternal_surname: '',
  identity_card: '',
  birth_date: '',
  gender: '',
  phone_number: '',

  // Profile
  bio: '',
  location: '',
  website_url: '',
  privacy_level: 'public'
});

const isSaving = ref(false);
const errorMessage = ref('');

const genderOptions = [
  { value: '', label: 'Seleccionar...' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_say', label: 'Prefiero no decir' }
];

// Initialize form with profile data
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.profile) {
      const pi = props.profile.personal_information || {};

      formData.value = {
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
      errorMessage.value = '';
    }
  }
);

const fullName = computed(() => {
  const parts = [
    formData.value.first_name,
    formData.value.second_name,
    formData.value.paternal_surname,
    formData.value.maternal_surname
  ].filter(Boolean);
  return parts.join(' ') || 'Sin nombre';
});

const handleSave = async () => {
  if (isSaving.value) return;

  // Validaciones básicas
  if (!formData.value.first_name?.trim()) {
    errorMessage.value = 'El primer nombre es obligatorio';
    return;
  }

  if (!formData.value.paternal_surname?.trim()) {
    errorMessage.value = 'El apellido paterno es obligatorio';
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = '';

    await profileService.updateProfile(props.profile.id, formData.value);

    emit('updated');
    emit('close');
  } catch (error) {
    console.error('Error updating profile:', error);
    errorMessage.value = error.response?.data?.message || 'Error al actualizar el perfil';
  } finally {
    isSaving.value = false;
  }
};

const handleClose = () => {
  if (!isSaving.value) {
    emit('close');
  }
};
</script>

<template>
  <SocialModal
    :is-open="isOpen"
    title="Editar "
    size="modal-lg"
    :scrollable="true"
    @close="handleClose"
  >
    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">{{ errorMessage }}</p>
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <!--  Personal -->
      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-4"> Personal</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Primer Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Primer Nombre
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.first_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Juan"
            />
          </div>

          <!-- Segundo Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Segundo Nombre</label>
            <input
              v-model="formData.second_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Carlos"
            />
          </div>

          <!-- Apellido Paterno -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Apellido Paterno
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.paternal_surname"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Pérez"
            />
          </div>

          <!-- Apellido Materno -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
            <input
              v-model="formData.maternal_surname"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="García"
            />
          </div>

          <!-- Cédula -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad</label>
            <input
              v-model="formData.identity_card"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="V-12345678"
            />
          </div>

          <!-- Fecha de Nacimiento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
            <input
              v-model="formData.birth_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Género -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Género</label>
            <select
              v-model="formData.gender"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Número de Teléfono</label>
            <input
              v-model="formData.phone_number"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+58 414-1234567"
            />
          </div>
        </div>

        <!-- Preview Nombre Completo -->
        <div class="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p class="text-sm text-emerald-800">
            <strong>Nombre completo:</strong>
            {{ fullName }}
          </p>
        </div>
      </section>

      <!--  del Perfil -->
      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Perfil Público</h3>

        <div class="space-y-4">
          <!-- Biografía -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
            <textarea
              v-model="formData.bio"
              rows="3"
              maxlength="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Cuéntanos sobre ti..."
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ formData.bio?.length || 0 }}/500 caracteres</p>
          </div>

          <!--  -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"></label>
            <input
              v-model="formData.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Caracas, Venezuela"
            />
          </div>

          <!-- Sitio Web -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
            <input
              v-model="formData.website_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>
      </section>

      <!-- Privacidad -->
      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-4"> de Privacidad</h3>

        <div class="space-y-3">
          <!-- Público -->
          <label
            class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
            :class="
              formData.privacy_level === 'public'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            "
          >
            <input v-model="formData.privacy_level" type="radio" value="public" class="mt-1" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <Globe :size="20" class="text-emerald-600" />
                <span class="font-semibold">Público</span>
              </div>
              <p class="text-sm text-gray-600">Cualquier persona puede ver tu perfil, posts y amigos</p>
            </div>
          </label>

          <!-- Privado -->
          <label
            class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all"
            :class="
              formData.privacy_level === 'private'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            "
          >
            <input v-model="formData.privacy_level" type="radio" value="private" class="mt-1" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <Lock :size="20" class="text-emerald-600" />
                <span class="font-semibold">Privado</span>
              </div>
              <p class="text-sm text-gray-600">Solo tus amigos pueden ver tu perfil y contenido</p>
            </div>
          </label>
        </div>
      </section>
    </form>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors border-0 cursor-pointer"
          @click="handleClose"
          :disabled="isSaving"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSaving"
          @click="handleSave"
        >
          {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </template>
  </SocialModal>
</template>
