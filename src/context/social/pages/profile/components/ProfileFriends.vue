<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Search, MoreHorizontal } from '@lucide/vue';
import { profileService } from '../services/profile.service';

const props = defineProps({
  profileId: { type: String, required: true }
});

const router = useRouter();
const friends = ref([]);
const searchQuery = ref('');
const isLoading = ref(true);
const errorMessage = ref('');

const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value;

  const query = searchQuery.value.toLowerCase();
  return friends.value.filter((friend) => {
    const name = friend.name || friend.username || '';
    return name.toLowerCase().includes(query);
  });
});

const loadFriends = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const response = await profileService.fetchFriends(props.profileId);
    friends.value = response.data || [];

    // Si hay mensaje de privacidad
    if (response.message && friends.value.length === 0) {
      errorMessage.value = response.message;
    }
  } catch (error) {
    console.error('Error loading friends:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar amigos';
  } finally {
    isLoading.value = false;
  }
};

const goToProfile = (friendId) => {
  router.push(`/social/profile/${friendId}`);
};

const getAvatarUrl = (friend) => {
  return (
    friend.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || friend.username)}`
  );
};

onMounted(() => {
  loadFriends();
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-900">{{ friends.length }} amigos</h2>
    </div>

    <!-- Search Input -->
    <div v-if="friends.length > 0" class="mb-5">
      <div class="relative bg-gray-100 rounded-full flex items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar"
          class="w-full pl-4 pr-10 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-[15px] text-gray-900 placeholder-gray-500"
        />
        <Search :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col gap-2">
      <div v-for="n in 8" :key="n" class="flex items-center gap-3.5 py-2 px-1 animate-pulse">
        <div class="w-14 h-14 bg-gray-200 rounded-full shrink-0"></div>
        <div class="flex flex-col gap-2 w-full">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Error/Privacy Message -->
    <div v-else-if="errorMessage" class="text-center py-12 text-gray-500">
      <Users :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold">{{ errorMessage }}</p>
    </div>

    <!-- Empty State (No Friends) -->
    <div v-else-if="friends.length === 0" class="text-center py-12 text-gray-500">
      <Users :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold">No hay amigos</p>
      <p class="text-sm mt-2">Este usuario aún no tiene amigos</p>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredFriends.length === 0" class="text-center py-12 text-gray-500">
      <Search :size="48" class="mx-auto mb-4 text-gray-300" />
      <p class="text-lg font-semibold">No se encontraron amigos</p>
      <p class="text-sm mt-2">Intenta con otro término de básqueda</p>
    </div>

    <!-- Friends List -->
    <div v-else class="flex flex-col gap-1">
      <div
        v-for="friend in filteredFriends"
        :key="friend.id"
        class="flex items-center justify-between w-full py-2 px-1 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
        @click="goToProfile(friend.id)"
      >
        <div class="flex items-center gap-3.5">
          <!-- Avatar -->
          <img
            :src="getAvatarUrl(friend)"
            :alt="friend.name || friend.username"
            class="w-14 h-14 rounded-full object-cover bg-gray-100 border border-gray-100"
          />

          <!-- Info -->
          <div class="flex flex-col">
            <h3 class="text-[16px] font-semibold text-gray-900 m-0 leading-tight">
              {{ friend.name || friend.username }}
            </h3>
            <p class="text-[13px] text-gray-500 m-0 mt-0.5">
              <template v-if="friend.mutual_friends_count > 0">
                {{ friend.mutual_friends_count }}
                {{ friend.mutual_friends_count === 1 ? 'amigo' : 'amigos' }} en común
              </template>
              <template v-else>@{{ friend.username }}</template>
            </p>
          </div>
        </div>

        <!-- Options Menu -->
        <button
          type="button"
          class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-500 border-0 bg-transparent cursor-pointer transition-colors shrink-0"
          @click.stop=""
        >
          <MoreHorizontal :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>
