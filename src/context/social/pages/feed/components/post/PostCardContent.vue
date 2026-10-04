<script setup>
import { computed } from 'vue';
import { Link2 } from '@lucide/vue';

const props = defineProps({
  post: { type: Object, required: true }
});

const postText = computed(() => props.post.text || props.post.body || '');
const postLink = computed(() => props.post.link || null);
const postImages = computed(() => {
  if (props.post.images && Array.isArray(props.post.images)) {
    return props.post.images;
  }
  if (props.post.image) {
    return [props.post.image];
  }
  return [];
});

const imageGridClass = computed(() => {
  const count = postImages.value.length;
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-2';
  if (count === 4) return 'grid-cols-2';
  return 'grid-cols-3';
});
</script>

<template>
  <div class="px-4 pb-3 space-y-3">
    <!-- Texto del post -->
    <p
      v-if="postText"
      class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words"
    >
      {{ postText }}
    </p>

    <!-- Link preview -->
    <a
      v-if="postLink"
      :href="postLink"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
    >
      <Link2 :size="16" class="text-gray-400 group-hover:text-emerald-600 transition-colors shrink-0" />
      <span class="text-sm text-emerald-600 dark:text-emerald-400 truncate">
        {{ postLink }}
      </span>
    </a>

    <!-- Imágenes -->
    <div v-if="postImages.length > 0" class="grid gap-1 rounded-lg overflow-hidden" :class="imageGridClass">
      <img
        v-for="(img, idx) in postImages.slice(0, 6)"
        :key="idx"
        :src="img"
        :alt="`Imagen ${idx + 1}`"
        class="w-full h-full object-cover"
        :class="{
          'col-span-2': postImages.length === 3 && idx === 0,
          'aspect-square': postImages.length > 1,
          'aspect-video': postImages.length === 1,
          'max-h-96': postImages.length === 1
        }"
        loading="lazy"
      />

      <!-- Indicador de más imágenes -->
      <div
        v-if="postImages.length > 6"
        class="relative aspect-square bg-gray-900/80 flex items-center justify-center"
      >
        <span class="text-white text-2xl font-bold">+{{ postImages.length - 6 }}</span>
      </div>
    </div>
  </div>
</template>
