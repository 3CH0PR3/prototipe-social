<script setup>
import { ref, watch, computed } from 'vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';

const props = defineProps({
  isOpen: Boolean,
  company: Object
});

const emit = defineEmits(['update:isOpen', 'apply']);

const form = ref({
  nuis: '',
  address: ''
});

const isSubmitting = ref(false);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.value = { nuis: '', address: '' };
    }
  }
);

const closeModal = () => emit('update:isOpen', false);

const handleSubmit = () => {
  emit('apply', { ...form.value });
};

const modalTitle = computed(() => `Aplicar a ${props.company?.company || 'la empresa'}`);
</script>

<template>
  <SocialModal :title="modalTitle" :is-open="isOpen" @close="closeModal" size="modal-md">
    <div class="p-2">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Por favor completa los siguientes datos para enviar tu solicitud de .
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            NUIS (Número Único de  del Suscriptor)
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.nuis"
            type="text"
            required
            maxlength="15"
            class="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm"
            placeholder="Ej. 123456789"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
             del Predio
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.address"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm"
            placeholder="Ej. Calle 123 # 45-67"
          />
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  </SocialModal>
</template>
