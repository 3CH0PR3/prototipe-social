<script setup>
import { computed, onMounted, watch, ref } from 'vue';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';
import PhotoLightbox from '@social/shared/components/PhotoLightbox.vue';
import PhotosSkeleton from '@layouts/social/components/skeleton/PhotosSkeleton.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  isOwnProfile: { type: Boolean, default: false },
  profileId: { type: [String, Number], default: null }
});

const profileStore = useProfileStore();

const lightboxOpen = ref(false);
const currentPhotoIndex = ref(0);

// Cargar posts para extraer fotos
onMounted(() => {
  if (props.profileId) {
    profileStore.fetchPosts(props.profileId);
  }
});

watch(
  () => props.profileId,
  (newId) => {
    if (newId) {
      profileStore.fetchPosts(newId);
    }
  }
);

// Extraer todas las fotos de los posts
const photos = computed(() => {
  const all = [];
  const posts = profileStore.posts || [];

  posts.forEach((post) => {
    if (Array.isArray(post.images)) {
      post.images.forEach((img) => all.push(img));
    } else if (post.image) {
      all.push(post.image);
    }
  });

  return all;
});

const openPhoto = (index) => {
  currentPhotoIndex.value = index;
  lightboxOpen.value = true;
};
</script>

<template>
  <!-- Loader -->
  <PhotosSkeleton v-if="profileStore.isLoading" />

  <!-- Contenido -->
  <div v-else class="soc-card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Fotos</h2>

    <!-- Estado vacío -->
    <div v-if="photos.length === 0" class="py-16 text-center text-gray-500">No hay fotos publicadas aún.</div>

    <!-- Grid de fotos -->
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

    <!-- Lightbox para visualizar fotos -->
    <PhotoLightbox
      :images="photos"
      v-model:index="currentPhotoIndex"
      :is-open="lightboxOpen"
      @close="lightboxOpen = false"
    />
  </div>
</template>
