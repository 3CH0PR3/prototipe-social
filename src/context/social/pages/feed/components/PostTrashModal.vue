<script setup>
import { Trash2 } from '@lucide/vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';
import SubmitButton from '@shared/components/button/SubmitButton.vue';

defineProps({
  isOpen: { type: Boolean, default: false },
  isDeleting: { type: Boolean, default: false },
});

defineEmits(['close', 'confirmDelete']);
</script>

<template>
  <SocialModal
    title="Mover publicación a la papelera"
    :isOpen="isOpen"
    maxWidth="max-w-sm"
    @close="$emit('close')"
  >
    <div class="p-6">
      <div class="flex items-start gap-4 mb-5">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 shrink-0">
          <Trash2 :size="24" class="text-rose-500" />
        </div>
        <div>
          <p class="text-gray-900 text-sm font-bold mb-1.5">¿Estás seguro?</p>
          <p class="text-gray-500 text-sm leading-relaxed">
            Esta publicación se eliminará de tu perfil, del feed y de los resultados de búsqueda.
          </p>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          @click="$emit('close')"
          :disabled="isDeleting"
        >
          Cancelar
        </button>
        <SubmitButton
          :disabled="isDeleting"
          :loading="isDeleting"
          variant="danger"
          class="!w-auto"
          loadingText="Moviendo"
          @click="$emit('confirmDelete')"
        >
          Mover a la papelera
        </SubmitButton>
      </div>
    </div>
  </SocialModal>
</template>
