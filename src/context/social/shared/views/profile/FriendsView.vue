<script setup>
import { computed, onMounted, watch } from 'vue';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';
import PersonCard from '@social/pages/explore/components/PersonCard.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  isOwnProfile: { type: Boolean, default: false },
  profileId: { type: [String, Number], default: null }
});

const profileStore = useProfileStore();

// Cargar amigos y solicitudes
const loadFriends = async (id) => {
  if (!id) return;
  await profileStore.fetchFriends(id);

  // Solo cargar solicitudes si es mi perfil
  if (props.isOwnProfile) {
    await profileStore.fetchRequests(id);
  }
};

onMounted(() => loadFriends(props.profileId));
watch(() => props.profileId, loadFriends);

// Solicitudes pendientes (solo para mi perfil)
const activeRequests = computed(() => {
  if (!props.isOwnProfile) return [];
  return (profileStore.requests || []).filter(
    (r) => r.has_pending_request_from === true || r.hasPendingRequestFrom === true
  );
});

// Amigos confirmados
const activeFriends = computed(() => profileStore.friends || []);

// Handlers para acciones de amistad
const handleAcceptRequest = async (request) => {
  // La lógica de aceptar está en el friendship store
  // Despuás de aceptar, recargar la lista
  await loadFriends(props.profileId);
};

const handleRejectRequest = async (request) => {
  // Similar a accept
  await loadFriends(props.profileId);
};

const handleRemoveFriend = async (friend) => {
  // Despuás de remover, recargar
  await loadFriends(props.profileId);
};
</script>

<template>
  <div class="profile-tabs-container p-4 space-y-8">
    <!-- Loader -->
    <div v-if="profileStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>

    <template v-else>
      <!-- Solicitudes de amistad (solo para mi perfil) -->
      <section v-if="isOwnProfile && activeRequests.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Solicitudes de amistad</h3>
          <span
            class="inline-flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
          >
            {{ activeRequests.length }}
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PersonCard
            v-for="request in activeRequests"
            :key="request.id"
            :person="request"
            @accept-request="handleAcceptRequest(request)"
            @reject-request="handleRejectRequest(request)"
          />
        </div>
      </section>

      <!-- Lista de amigos -->
      <section v-if="activeFriends.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isOwnProfile ? 'Mis amigos' : 'Amigos' }}
          </h3>
          <span class="text-sm text-gray-500 font-normal">{{ activeFriends.length }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <PersonCard
            v-for="friend in activeFriends"
            :key="friend.id"
            :person="friend"
            @remove-friend="handleRemoveFriend(friend)"
          />
        </div>
      </section>

      <!-- Estado vacío -->
      <div
        v-if="activeFriends.length === 0 && !(isOwnProfile && activeRequests.length > 0)"
        class="py-16 text-center"
      >
        <p class="text-sm text-gray-500">No hay amigos que mostrar.</p>
      </div>
    </template>
  </div>
</template>
