<script setup>
import { ref, computed } from 'vue';
import { Flag } from '@lucide/vue';
import { feedService } from '../services/feed.service.js';
import { useToast } from '@shared/composables/useToast';
import SocialModal from '@layouts/social/components/SocialModal.vue';

const props = defineProps({
  postId: { type: String, required: true },
  isOpen: { type: Boolean, default: false }
});

const emit  = defineEmits(['close', 'reported']);
const toast = useToast();

const REASONS = [
  { value: 'spam',               label: 'Spam',                        desc: 'Contenido repetitivo o publicidad no deseada' },
  { value: 'misinformation',     label: 'Información falsa',           desc: 'Noticias falsas o información engañosa' },
  { value: 'harassment',         label: 'Acoso o bullying',            desc: 'Contenido que ataca a personas específicas' },
  { value: 'hate_speech',        label: 'Discurso de odio',            desc: 'Contenido discriminatorio o violento' },
  { value: 'other',              label: 'Otro motivo',                 desc: 'Algo que no encaja en las categorías anteriores' },
];

const selectedReason = ref('');
const details        = ref('');
const blockUser      = ref(false);
const submitting     = ref(false);

const isValid = computed(() => !!selectedReason.value);

const reset = () => {
  selectedReason.value = '';
  details.value        = '';
  blockUser.value      = false;
  submitting.value     = false;
};

const close = () => {
  reset();
  emit('close');
};

const submit = async () => {
  if (!isValid.value || submitting.value) return;
  submitting.value = true;
  try {
    await feedService.reportPost(props.postId, selectedReason.value, details.value || null, blockUser.value);
    toast.success('Reporte enviado. El equipo de GEA-WRC lo revisará.');
    emit('reported');
    close();
  } catch {
    toast.error('No se pudo enviar el reporte. Inténtalo de nuevo.');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <SocialModal
    title="Reportar "
    :isOpen="isOpen"
    maxWidth="max-w-md"
    :scrollable="true"
    :perfectScrollbar="true"
    @close="close"
  >
    <div class="soc-report-modal">
      <p class="soc-report-intro">
        ¿Por qué quieres reportar esta ? El equipo de GEA-WRC revisará tu reporte.
      </p>

      <!-- Razones -->
      <fieldset class="soc-report-reasons">
        <legend class="sr-only">Motivo del reporte</legend>
        <label
          v-for="r in REASONS"
          :key="r.value"
          class="soc-report-reason"
          :class="{ 'soc-report-reason--selected': selectedReason === r.value }"
        >
          <input
            type="radio"
            :value="r.value"
            v-model="selectedReason"
            class="soc-report-radio"
          />
          <span class="soc-report-reason-content">
            <span class="soc-report-reason-label">{{ r.label }}</span>
            <span class="soc-report-reason-desc">{{ r.desc }}</span>
          </span>
        </label>
      </fieldset>

      <!-- Detalle opcional -->
      <div v-if="selectedReason === 'other'" class="soc-report-details">
        <label class="soc-report-details-label">
           adicional <span class="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          v-model="details"
          class="soc-report-textarea"
          placeholder="Describe el problema con más detalle..."
          rows="3"
          maxlength="500"
        ></textarea>
        <span class="soc-report-char-count">{{ details.length }}/500</span>
      </div>

      <!-- Bloquear usuario -->
      <div class="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-100 flex items-start gap-2 md:gap-3">
        <div class="flex items-center h-4 md:h-5">
          <input
            id="block_user"
            type="checkbox"
            v-model="blockUser"
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 focus:ring-2 cursor-pointer"
          />
        </div>
        <div class="text-[11px] md:text-sm">
          <label for="block_user" class="font-medium text-gray-900 cursor-pointer">Bloquear a este usuario</label>
          <p class="text-gray-500 text-[9px] md:text-xs mt-0.5 leading-snug">
            No volverás a ver sus publicaciones y él no podrá interactuar contigo en el futuro.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="soc-report-footer">
        <button
          type="button"
          class="soc-report-btn-cancel"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="soc-report-btn-submit"
          :disabled="!isValid || submitting"
          @click="submit"
        >
          <Flag v-if="!submitting" :size="15" />
          <span>{{ submitting ? 'Enviando...' : 'Enviar reporte' }}</span>
        </button>
      </div>
    </template>
  </SocialModal>
</template>
