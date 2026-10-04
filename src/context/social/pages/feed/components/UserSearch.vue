<script setup>
import { ref } from 'vue';
import { useProfilesStore } from '../../profiles/stores/useProfile.store';
import { ProfilesService } from '../../profiles/services/profiles.service';

const profilesStore = useProfilesStore();
const query = ref('');
const results = ref([]);
const isSearching = ref(false);

const handleSearch = async () => {
  if (!query.value.trim() || query.value.length < 3) {
    results.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const res = await ProfilesService.search(query.value);
    results.value = res.data?.profiles || res.data?.data || [];
  } catch (error) {
    console.error('Error searching profiles:', error);
  } finally {
    isSearching.value = false;
  }
};

const sendRequest = async (profile) => {
  profile.sending = true;
  try {
    await profilesStore.sendFriendRequest(profile.social_user_id);
    profile.sent = true;
  } catch (error) {
    console.error('Error sending request:', error);
  } finally {
    profile.sending = false;
  }
};
</script>

<template>
  <div class="soc-card mb-6 p-4">
    <h3 class="soc-title text-sm mb-3 uppercase tracking-wider">Buscar personas</h3>
    <div class="relative">
      <input
        type="text"
        v-model="query"
        @input="handleSearch"
        placeholder="Buscar por nombre..."
        class="w-full bg-gray-100 border border-transparent rounded-full px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-colors"
      />
      <div v-if="isSearching" class="absolute right-3 top-2.5">
        <div class="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    </div>

    <div v-if="results.length > 0" class="mt-4 space-y-3">
      <div
        v-for="profile in results"
        :key="profile.id"
        class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div class="flex items-center gap-3">
          <img
            :src="
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=random`
            "
            class="soc-avatar-md border-2 border-surface"
          />
          <router-link
            :to="{
              name: 'social.profiles.publications',
              params: { id: profile.id }
            }"
            class="flex flex-col hover:underline"
          >
            <span class="text-sm font-medium text-gray-900">{{ profile.display_name }}</span>
            <span class="text-xs text-gray-500">@{{ profile.slug }}</span>
          </router-link>
        </div>
        <button
          v-if="!profile.sent"
          @click="sendRequest(profile)"
          :disabled="profile.sending"
          class="soc-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
        >
          <svg v-if="!profile.sending" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            ></path>
          </svg>
          {{ profile.sending ? '...' : 'Añadir' }}
        </button>
        <span
          v-else
          class="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Enviada
        </span>
      </div>
    </div>
    <div v-else-if="query.length >= 3 && !isSearching" class="mt-4 text-xs text-gray-500 text-center py-2">
      No se encontraron personas con ese nombre.
    </div>
  </div>
</template>
