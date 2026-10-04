<script setup>
import { computed, ref } from 'vue';
import PhotoLightbox from '@social/shared/components/PhotoLightbox.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  posts: { type: Array, default: () => [] }
});

const photos = computed(() => {
  const all = [];
  props.posts.forEach((post) => {
    if (Array.isArray(post.images)) {
      post.images.forEach((img) => all.push(img));
    } else if (post.image) {
      all.push(post.image);
    }
  });
  return all;
});

const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

const openPhoto = (index) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};
</script>

<template>
  <div class="soc-card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Fotos</h2>

    <div v-if="photos.length === 0" class="py-16 text-center text-gray-500">No hay fotos publicadas aún.</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <button
        v-for="(photo, index) in photos"
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
      :images="photos"
      v-model:index="currentPhotoIndex"
      :is-open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
