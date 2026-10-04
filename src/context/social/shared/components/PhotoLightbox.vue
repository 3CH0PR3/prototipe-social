<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { X, ChevronLeft, ChevronRight } from '@lucide/vue';

const props = defineProps({
  images: { type: Array, required: true },
  index: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'update:index']);

const currentIndex = computed({
  get: () => props.index,
  set: (val) => emit('update:index', val)
});

const currentImage = computed(() => {
  if (props.images.length === 0) return null;
  return props.images[currentIndex.value];
});

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // loop
  }
};

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1; // loop
  }
};

const handleKeydown = (e) => {
  if (!props.isOpen) return;
  if (e.key === 'Escape') emit('close');
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      @click="emit('close')"
    >
      <!-- Botón Cerrar -->
      <button
        @click.stop="$emit('close')"
        class="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
      >
        <X class="w-6 h-6" />
      </button>

      <!-- Botón Anterior -->
      <button
        v-if="images.length > 1"
        @click.stop="prev"
        class="absolute left-4 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
      >
        <ChevronLeft class="w-8 h-8" />
      </button>

      <!-- Imagen -->
      <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" @click.stop>
        <img
          v-if="currentImage"
          :src="currentImage"
          alt="Foto ampliada"
          class="max-w-full max-h-[90vh] object-contain select-none"
        />
      </div>

      <!-- Botón Siguiente -->
      <button
        v-if="images.length > 1"
        @click.stop="next"
        class="absolute right-4 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors"
      >
        <ChevronRight class="w-8 h-8" />
      </button>

      <!-- Indicador -->
      <div
        v-if="images.length > 1"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1.5 rounded-full text-sm"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </Teleport>
</template>
