<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';
import { AlertCircle } from '@lucide/vue';

const props = defineProps({
  title: { type: String, default: 'Confirmar acción' },
  description: {
    type: String,
    default: '¿Estás seguro de que deseas realizar esta acción?'
  },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
  confirmClass: {
    type: String,
    default: 'bg-brand-500 hover:bg-brand-600 focus:ring-brand-500'
  },
  icon: { type: [Object, Function], default: () => AlertCircle },
  iconClass: {
    type: String,
    default: 'text-brand-500 bg-brand-100 dark:bg-brand-500/20'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const modalRef = ref(null);

const open = () => modalRef.value?.open?.();
const close = () => modalRef.value?.close?.();

defineExpose({ open, close });

const handleConfirm = () => {
  emit('confirm');
  close();
};

const handleCancel = () => {
  emit('cancel');
  close();
};
</script>

<template>
  <Modal id="confirm-modal" ref="modalRef" size="modal-md" :centered="true" bodyClass="p-0">
    <template #header>
      <div class="content d-flex flex-column justify-content-center">
        <div class="d-flex align-items-center mb-1 gap-3">
          <component
            v-if="typeof icon === 'object'"
            :is="icon"
            class="text-brand-500"
            style="width: 25px; height: 25px"
          />
          <h1 class="modal-title fs-4 fw-bold">{{ title }}</h1>
        </div>
        <p class="small text-muted mt-3">{{ description }}</p>
      </div>
    </template>

    <template #body>
      <!-- Body can be used if we need inputs, for a simple confirm it's empty -->
    </template>

    <template #footer>
      <div class="haddler">
        <button type="button" class="btn" :class="confirmClass" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </template>
  </Modal>
</template>
