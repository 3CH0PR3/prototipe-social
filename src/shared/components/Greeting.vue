<script setup>
import { usePage } from '@inertiajs/vue3';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const page = usePage();
const user = page.props.auth?.user;

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'start-trading']);
const isOpen = ref(props.modelValue);

// Methods
const closeModal = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
};

const startTrading = () => {
  emit('start-trading');
  closeModal();
};

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  }
);

onMounted(() => {
  if (isOpen.value) {
    document.body.style.overflow = 'hidden';
  }
});

onUnmounted(() => {
  document.body.style.overflow = 'auto';
});

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
    <div class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white shadow-2xl">
      <button
        @click="closeModal"
        class="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-gray-100"
      >
        <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      <!-- Header -->
      <div class="px-8 pb-6 pt-8 text-center">
        <div
          class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600"
        >
          <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </div>
        <h1 class="mb-2 text-3xl font-bold text-gray-900">Bienvenido a WRC Trading</h1>
        <p class="text-lg text-gray-600">World Recycling Coin Platform</p>
      </div>

      <div class="px-8 pb-8">
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="mb-4 text-2xl font-semibold text-gray-900">El Futuro del Reciclaje es Blockchain</h2>
            <p class="leading-relaxed text-gray-700">
              World Recycling Coin revoluciona la industria del reciclaje con tecnología blockchain de
              vanguardia. Gana WRC tokens mientras construyes un futuro sostenible para las próximas
              generaciones.
            </p>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div class="flex items-start space-x-4">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="mb-1 font-semibold text-gray-900">Gana WRC Tokens</h3>
                <p class="text-sm text-gray-600">Obtén recompensas por tus actividades de reciclaje</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="mb-1 font-semibold text-gray-900">Tecnología Blockchain</h3>
                <p class="text-sm text-gray-600">Transparencia y seguridad garantizada</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="mb-1 font-semibold text-gray-900">Impacto Global</h3>
                <p class="text-sm text-gray-600">Contribuye al futuro sostenible del planeta</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 class="mb-1 font-semibold text-gray-900">Trading Avanzado</h3>
                <p class="text-sm text-gray-600">Plataforma profesional de intercambio</p>
              </div>
            </div>
          </div>

          <div class="pt-6 text-center">
            <button
              @click="startTrading"
              class="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
            >
              Comenzar Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
