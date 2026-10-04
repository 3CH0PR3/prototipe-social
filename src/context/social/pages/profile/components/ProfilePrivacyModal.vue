<script setup>
import { ref, computed } from 'vue';
import { X, Lock, Globe, Check } from '@lucide/vue';
import { profileService } from '../services/profile.service';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPrivacyLevel: { type: String, default: 'public' },
  profileId: { type: String, required: true }
});

const emit = defineEmits(['close', 'updated']);

const selectedPrivacy = ref(props.currentPrivacyLevel);
const isSaving = ref(false);
const errorMessage = ref('');

const privacyOptions = [
  {
    value: 'public',
    label: 'Público',
    icon: Globe,
    description: 'Cualquier persona puede ver tu perfil, posts y amigos'
  },
  {
    value: 'private',
    label: 'Privado',
    icon: Lock,
    description: 'Solo tus amigos pueden ver tu perfil y contenido'
  }
];

const hasChanges = computed(() => selectedPrivacy.value !== props.currentPrivacyLevel);

const savePrivacy = async () => {
  if (!hasChanges.value || isSaving.value) return;

  try {
    isSaving.value = true;
    errorMessage.value = '';

    await profileService.updateProfile(props.profileId, {
      privacy_level: selectedPrivacy.value
    });

    emit('updated', selectedPrivacy.value);
    emit('close');
  } catch (error) {
    console.error('Error updating privacy:', error);
    errorMessage.value = error.response?.data?.message || 'Error al actualizar  de privacidad';
  } finally {
    isSaving.value = false;
  }
};

const closeModal = () => {
  if (!isSaving.value) {
    selectedPrivacy.value = props.currentPrivacyLevel;
    errorMessage.value = '';
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-900"> de privacidad</h2>
            <button
              type="button"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors border-0 bg-transparent cursor-pointer"
              @click="closeModal"
              :disabled="isSaving"
            >
              <X :size="24" class="text-gray-600" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <p class="text-gray-600 mb-6">Elige quién puede ver tu perfil, publicaciones y lista de amigos</p>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>

            <!-- Privacy Options -->
            <div class="space-y-3">
              <div
                v-for="option in privacyOptions"
                :key="option.value"
                class="border-2 rounded-lg p-4 cursor-pointer transition-all"
                :class="
                  selectedPrivacy === option.value
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                "
                @click="selectedPrivacy = option.value"
              >
                <div class="flex items-start gap-3">
                  <!-- Icon -->
                  <div
                    class="p-2 rounded-full flex-shrink-0"
                    :class="selectedPrivacy === option.value ? 'bg-emerald-100' : 'bg-gray-100'"
                  >
                    <component
                      :is="option.icon"
                      :size="24"
                      :class="selectedPrivacy === option.value ? 'text-emerald-600' : 'text-gray-600'"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <h3
                        class="font-semibold text-lg"
                        :class="selectedPrivacy === option.value ? 'text-emerald-900' : 'text-gray-900'"
                      >
                        {{ option.label }}
                      </h3>

                      <!-- Check Icon -->
                      <Check
                        v-if="selectedPrivacy === option.value"
                        :size="20"
                        class="text-emerald-600 flex-shrink-0"
                      />
                    </div>
                    <p class="text-sm text-gray-600">
                      {{ option.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warning for Private -->
            <div
              v-if="selectedPrivacy === 'private'"
              class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <p class="text-sm text-yellow-800">
                <strong>Nota:</strong>
                Al hacer tu perfil privado, solo las personas que sean tus amigos podrán ver tu contenido.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors border-0 cursor-pointer"
              @click="closeModal"
              :disabled="isSaving"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!hasChanges || isSaving"
              @click="savePrivacy"
            >
              {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
