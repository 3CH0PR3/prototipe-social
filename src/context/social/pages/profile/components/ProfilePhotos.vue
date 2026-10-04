<script setup>
import { computed, ref } from 'vue';
import PhotoLightbox from '@social/shared/components/PhotoLightbox.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
});

// Extraer todas las imágenes de todos los posts
const photos = computed(() => {
  const allPhotos = [];
  props.posts.forEach((post) => {
    if (post.images && Array.isArray(post.images)) {
      post.images.forEach((img) => {
        allPhotos.push(img);
      });
    } else if (post.image) {
      allPhotos.push(post.image);
    }
  });
  return allPhotos;
});

const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

const openPhoto = (index) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-lg font-semibold mb-4">Fotos</h2>

    <div v-if="photos.length === 0" class="text-center text-gray-500 py-8">
      Este usuario aún no ha publicado fotos.
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="bg-white p-2 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow aspect-square group"
        @click="openPhoto(index)"
      >
        <div class="w-full h-full overflow-hidden rounded">
          <img
            :src="photo"
            alt="Foto"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>

    <PhotoLightbox
      :images="photos"
      v-model:index="currentPhotoIndex"
      :is-open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
