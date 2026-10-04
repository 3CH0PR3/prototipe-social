<script setup>
import { ref } from 'vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import SubmitButton from '@shared/components/button/SubmitButton.vue';
import TextInput from '@/shared/components/form/TextInput.vue';
import { ShieldCheck, UploadCloud, FileText } from '@lucide/vue';

const userStore = useUserStore();
const isSubmitting = ref(false);
const paymentReference = ref('');
const files = ref([]);

const handleFileChange = (e) => {
  files.value = Array.from(e.target.files);
};

const submitVerification = async () => {
  if (!paymentReference.value || files.value.length === 0) return;
  isSubmitting.value = true;

  try {
    // In a real scenario, this would call the /api/settings/company/verification/submit endpoint
    // with FormData (documents + payment_reference)
    await new Promise(r => setTimeout(r, 1500));
    alert('Solicitud enviada exitosamente a la central.');
    paymentReference.value = '';
    files.value = [];
  } catch (error) {
    alert('Error al enviar solicitud: ' + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 md:p-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">

      <!-- Header -->
      <div class="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6 mb-8">
        <div class="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <ShieldCheck class="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Verificación de Empresa</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Obtén la insignia de empresa verificada en la red social y desbloquea beneficios exclusivos enviando los documentos a la central.
          </p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitVerification" class="space-y-6">

        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Consolidación de Pago</h3>
          <p class="text-sm text-gray-500 mb-4">Ingresa el número de referencia del pago emitido por los canales oficiales.</p>
          <TextInput
            v-model="paymentReference"
            label="Referencia de Pago"
            placeholder="Ej: REF-109283-GEA"
            required
          />
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Documentos de Soporte</h3>
          <p class="text-sm text-gray-500 mb-4">Sube los documentos legales de la empresa en formato PDF o Imagen.</p>

          <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud class="w-8 h-8 text-gray-400 mb-2" />
              <p class="mb-1 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
            </div>
            <input type="file" multiple accept=".pdf,image/*" class="hidden" @change="handleFileChange" />
          </label>

          <!-- File List -->
          <ul v-if="files.length > 0" class="mt-4 space-y-2">
            <li v-for="(file, index) in files" :key="index" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              <FileText class="w-4 h-4 text-blue-500 shrink-0" />
              <span class="truncate">{{ file.name }}</span>
            </li>
          </ul>
        </div>

        <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
          <SubmitButton
            :loading="isSubmitting"
            loadingText="Enviando solicitud..."
            :disabled="isSubmitting || !paymentReference || files.length === 0"
            class="w-full md:w-auto"
          >
            Enviar Solicitud a la Central
          </SubmitButton>
        </div>
      </form>

    </div>
  </div>
</template>
