<script setup>
import { onMounted, watch, ref } from 'vue';
import { usePhotosStore } from '../stores/usePhotos.store.js';
import PhotoLightbox from '@social/shared/components/PhotoLightbox.vue';

const props = defineProps({
  person: { type: Object, default: () => ({}) },
  isMe: { type: Boolean, default: false },
  personId: { type: String, default: null }
});

const photosStore = usePhotosStore();

const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

onMounted(() => {
  if (props.personId) {
    photosStore.fetchPhotos(props.personId);
  }
});

watch(
  () => props.personId,
  (newId) => {
    if (newId) {
      photosStore.fetchPhotos(newId);
    }
  }
);

const openPhoto = (index) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};
</script>

<template>
  <div class="soc-card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Fotos</h2>

    <!-- Loader -->
    <div v-if="photosStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="photosStore.photos.length === 0" class="py-16 text-center text-gray-500">
      No hay fotos publicadas aún.
    </div>

    <!-- Grid de fotos -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <button
        v-for="(photo, index) in photosStore.photos"
        :key="index"
        type="button"
        class="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        @click="openPhoto(index)"
      >
        <img
          :src="photo"
          alt="Foto"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </button>
    </div>

    <PhotoLightbox
      :images="photosStore.photos"
      v-model:index="currentPhotoIndex"
      :is-open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
