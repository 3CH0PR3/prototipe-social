<script setup>
import { ref, onMounted, watch } from 'vue';
import { FileText } from '@lucide/vue';
import PostCard from '@/contexts/social/pages/feed/components/PostCard.vue';
import { profileService } from '../services/profile.service';

const props = defineProps({
  profileId: { type: String, required: true }
});

const posts = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const currentPage = ref(1);
const hasMore = ref(true);

const loadPosts = async (page = 1) => {
  try {
    if (page === 1) {
      isLoading.value = true;
    }
    errorMessage.value = '';

    const response = await profileService.fetchPosts(props.profileId);

    if (page === 1) {
      posts.value = response.data || [];
    } else {
      posts.value = [...posts.value, ...(response.data || [])];
    }

    // Si hay mensaje de privacidad pero no hay posts
    if (response.message && posts.value.length === 0) {
      errorMessage.value = response.message;
    }

    // Check si hay más páginas (si viene )
    hasMore.value = response.meta?.current_page < response.meta?.last_page;
  } catch (error) {
    console.error('Error loading posts:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar publicaciones';
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  if (!hasMore.value || isLoading.value) return;
  currentPage.value++;
  loadPosts(currentPage.value);
};

// Recargar posts cuando cambia el perfil
watch(
  () => props.profileId,
  () => {
    currentPage.value = 1;
    hasMore.value = true;
    loadPosts(1);
  },
  { immediate: false }
);

onMounted(() => {
  loadPosts();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading && posts.length === 0" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/6"></div>
          </div>
        </div>
        <div class="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>

    <!-- Error/Privacy Message -->
    <div v-else-if="errorMessage" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <FileText :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold text-gray-900 mb-2">{{ errorMessage }}</p>
      <p class="text-sm text-gray-500">
        {{
          errorMessage.includes('privado')
            ? 'Solo los amigos de este usuario pueden ver sus publicaciones'
            : ''
        }}
      </p>
    </div>

    <!-- Empty State (No Posts) -->
    <div v-else-if="posts.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <FileText :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold text-gray-900 mb-2">No hay publicaciones</p>
      <p class="text-sm text-gray-500">Este usuario aún no ha publicado nada</p>
    </div>

    <!-- Posts List -->
    <template v-else>
      <PostCard v-for="post in posts" :key="post.id" :post="post" />

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center py-4">
        <button
          type="button"
          class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          @click="loadMore"
        >
          {{ isLoading ? 'Cargando...' : 'Cargar más publicaciones' }}
        </button>
      </div>

      <!-- End Message -->
      <div v-else-if="posts.length > 0" class="text-center py-4 text-gray-500 text-sm">
        No hay más publicaciones
      </div>
    </template>
  </div>
</template>
