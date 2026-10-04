<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProfilesStore } from '../../profiles/stores/useProfile.store';
import PostCard from '../components/PostCard.vue';

const route = useRoute();
const profilesStore = useProfilesStore();
const profile = ref(null);
const loading = ref(true);
const posts = ref([]);

const fetchProfile = async () => {
  loading.value = true;
  try {
    const username = route.params.username;
    profile.value = await profilesStore.fetchProfile(username);

    // Obtener posts del usuario
    // const postRes = await profilesStore.getUserPosts(username);
    // posts.value = postRes.data?.data || [];
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>

    <div v-else-if="profile" class="soc-card mb-6 overflow-hidden">
      <div class="h-48 bg-green-600 w-full relative">
        <img v-if="profile.cover" :src="profile.cover" class="w-full h-full object-cover" />
      </div>

      <!-- Profile Info -->
      <div class="px-6 pb-6 relative">
        <div class="flex justify-between items-end -mt-16 mb-4">
          <img
            :src="
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=random`
            "
            class="w-32 h-32 rounded-full border-4 border-white bg-white shadow-sm object-cover"
          />

          <div class="flex gap-2">
            <button class="soc-btn-primary">Añadir a mis amigos</button>
            <button class="soc-btn-secondary">Mensaje</button>
          </div>
        </div>

        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ profile.display_name }}
          </h1>
          <p class="text-gray-500 font-medium">@{{ profile.slug }}</p>
          <p v-if="profile.bio" class="mt-2 text-gray-700">
            {{ profile.bio }}
          </p>

          <div class="flex gap-4 mt-4 text-sm text-gray-500">
            <span v-if="profile.company_name" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
              {{ profile.company_name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Profile Tabs -->
      <div class="border-t border-gray-100 flex">
        <button class="px-6 py-3 text-green-600 border-b-2 border-green-600 font-medium text-sm">
          Publicaciones
        </button>
        <button
          class="px-6 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          Información
        </button>
        <button
          class="px-6 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          Amigos
        </button>
      </div>
    </div>

    <div v-else class="text-center p-12 soc-card">
      <h3 class="soc-title text-lg">Perfil no encontrado</h3>
      <p class="text-gray-500">La persona que buscas no existe o no está disponible.</p>
    </div>
  </div>
</template>
