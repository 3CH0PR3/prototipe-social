<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';

const props = defineProps({
  profileId: { type: [String, Number], required: true },
  isOwnProfile: { type: Boolean, default: false }
});

const router = useRouter();
const profileStore = useProfileStore();

// Cargar amigos cuando se monta
onMounted(() => {
  if (props.profileId) {
    profileStore.fetchFriends(props.profileId);
  }
});

const friends = computed(() => profileStore.friends || []);
const friendsCount = computed(() => friends.value.length);
const previewFriends = computed(() => friends.value.slice(0, 9));

const goToFriendsTab = () => {
  router.push({
    name: 'social.profiles.friends',
    params: { id: props.profileId }
  });
};

const goToFriendProfile = (friendId) => {
  router.push({
    name: 'social.profiles.publications',
    params: { id: friendId }
  });
};

const getFriendName = (friend) => {
  if (friend.personal_information) {
    const firstName = friend.personal_information.first_name || friend.first_name;
    const lastName = friend.personal_information.paternal_surname || friend.paternal_surname;
    return `${firstName || ''} ${lastName || ''}`.trim() || friend.username || friend.name;
  }
  return friend.name || friend.username || 'Usuario';
};

const getFriendAvatar = (friend) => {
  return (
    friend.avatar_url ||
    friend.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(getFriendName(friend))}`
  );
};
</script>

<template>
  <div v-if="friendsCount > 0" class="soc-card p-2 md:p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Amigos</h3>
      <button
        @click="goToFriendsTab"
        class="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
      >
        Ver todos los amigos
      </button>
    </div>

    <!-- Contador de amigos -->
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
      {{ friendsCount }} {{ friendsCount === 1 ? 'amigo' : 'amigos' }}
    </p>

    <!-- Grid de amigos (3x3) -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="friend in previewFriends"
        :key="friend.id"
        @click="goToFriendProfile(friend.id)"
        class="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <img
          :src="getFriendAvatar(friend)"
          :alt="getFriendName(friend)"
          class="w-full aspect-square object-cover rounded-lg"
        />
        <span class="text-xs font-medium text-gray-900 dark:text-white text-center line-clamp-2 w-full">
          {{ getFriendName(friend) }}
        </span>
      </button>
    </div>

    <!-- Botón "Ver todos" adicional (si hay más de 9) -->
    <button
      v-if="friendsCount > 9"
      @click="goToFriendsTab"
      class="w-full mt-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      Ver todos los amigos
    </button>
  </div>
</template>
