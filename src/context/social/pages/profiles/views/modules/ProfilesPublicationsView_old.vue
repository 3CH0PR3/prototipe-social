<script setup>
import { computed } from 'vue';
import { MapPin, Link2, Calendar } from '@lucide/vue';
import PostCard from '@social/pages/feed/components/PostCard.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  posts: { type: Array, default: () => [] },
  friends: { type: Array, default: () => [] },
  profileId: { type: String, default: null }
});

const birthDate = computed(() => {
  const pi = props.profile.personal_information || {};
  const d = pi.birth_date || props.profile.birthdate;
  if (!d) return null;
  const [y, m, day] = d.split('-').map(Number);
  if (!y) return d;
  return new Date(y, m - 1, day).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 items-start">
    <!-- Sidebar: detalles rápidos -->
    <div class="w-full md:w-1/3 shrink-0 md:sticky md:top-20">
      <div class="soc-card p-4 space-y-3">
        <h2 class="text-md font-medium text-gray-900 dark:text-white"></h2>

        <!-- <p v-if="profile.bio" class="text-sm text-gray-600 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-800">
          {{ profile.bio }}
        </p> -->

        <div v-if="profile.location" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <MapPin class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ profile.location }}</span>
        </div>

        <div v-if="birthDate" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
          <span>{{ birthDate }}</span>
        </div>

        <div v-if="profile.website_url" class="flex items-center gap-3 text-sm">
          <Link2 class="w-4 h-4 text-gray-400 shrink-0" />
          <a
            :href="profile.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-emerald-600 hover:underline truncate text-sm"
          >
            {{ profile.website_url }}
          </a>
        </div>

        <p
          v-if="!profile.bio && !profile.location && !birthDate && !profile.website_url"
          class="text-sm text-gray-400 italic"
        >
          Sin  añadida
        </p>
      </div>
    </div>

    <!-- Feed de publicaciones -->
    <div class="w-full md:w-2/3 flex flex-col md:gap-4">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
      <div v-if="!posts.length" class="py-12 text-center soc-card">
        <p class="text-gray-500">No hay publicaciones aún.</p>
      </div>
    </div>
  </div>
</template>
