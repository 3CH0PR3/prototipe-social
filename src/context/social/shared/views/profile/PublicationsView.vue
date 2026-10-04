<script setup>
import { computed, onMounted, watch } from 'vue';
import { MapPin, Link2, Calendar } from '@lucide/vue';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';
import PostComposer from '@social/pages/feed/components/PostComposer.vue';
import PostCard from '@social/pages/feed/components/PostCard.vue';
import FriendsPreviewCard from '@social/shared/components/FriendsPreviewCard.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  isOwnProfile: { type: Boolean, default: false },
  profileId: { type: [String, Number], default: null }
});

const emit = defineEmits(['openEdit']);

const profileStore = useProfileStore();

// Cargar posts cuando se monta
onMounted(() => {
  if (props.profileId) {
    profileStore.fetchPosts(props.profileId);
  }
});

// Recargar si cambia el profileId
watch(
  () => props.profileId,
  (newId) => {
    if (newId) {
      profileStore.fetchPosts(newId);
    }
  }
);

// Computeds para la UI
const pi = computed(() => props.profile?.personal_information || {});

const birthDate = computed(() => {
  const d = pi.value.birth_date || props.profile.birthdate;
  if (!d) return null;
  const [y, m, day] = d.split('-').map(Number);
  if (!y) return d;
  return new Date(y, m - 1, day).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Handler cuando se crea un post
const handlePostCreated = (post) => {
  if (post && profileStore.posts) {
    profileStore.posts.unshift(post);
  }
};

// Handler para eliminar post
const handlePostDeleted = (postId) => {
  const index = profileStore.posts.findIndex((p) => p.id === postId);
  if (index !== -1) {
    profileStore.posts.splice(index, 1);
  }
};
</script>

<template>
  <div class="flex flex-col md:flex-row md:gap-4 items-start">
    <!-- Sidebar:  rápida + amigos (sticky) -->
    <div class="w-full md:w-1/3 shrink-0 md:space-y-4 md:sticky md:top-20 md:self-start">
      <!-- Card de  -->
      <div class="soc-card p-2 md:p-4 space-y-3">
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

        <!-- Estadásticas -->
        <div class="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
          <h3 class="text-md font-medium text-gray-900 dark:text-white">Estadásticas</h3>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ profile?.friends_count ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Amigos</p>
            </div>
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ profile?.followers_count ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Seguidores</p>
            </div>
            <div class="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-2">
              <p class="text-lg font-bold text-gray-900 dark:text-white">
                {{ profileStore.posts?.length ?? 0 }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Posts</p>
            </div>
          </div>
        </div>

        <p
          v-if="!profile.bio && !profile.location && !birthDate && !profile.website_url"
          class="text-sm text-gray-400 italic"
        >
          Sin  añadida
        </p>
      </div>

      <!-- Card de Amigos (preview 9 amigos) -->
      <FriendsPreviewCard v-if="profileId" :profile-id="profileId" :is-own-profile="isOwnProfile" />
    </div>

    <!-- Feed de publicaciones -->
    <div class="w-full md:w-2/3 flex flex-col md:gap-4">
      <!-- Loader -->
      <div v-if="profileStore.isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>

      <!-- Composer + Posts -->
      <template v-else>
        <!-- Composer solo si es mi perfil -->
        <PostComposer v-if="isOwnProfile" :margin="false" @post-created="handlePostCreated" />

        <!-- Posts -->
        <PostCard
          v-for="post in profileStore.posts"
          :key="post.id"
          :post="post"
          @deleted="handlePostDeleted"
        />

        <!-- Estado vacío -->
        <div v-if="!profileStore.posts || !profileStore.posts.length" class="py-12 text-center soc-card">
          <p class="text-gray-500">No hay publicaciones aún.</p>
        </div>
      </template>
    </div>
  </div>
</template>
