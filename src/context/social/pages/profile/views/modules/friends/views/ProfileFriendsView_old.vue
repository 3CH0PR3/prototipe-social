<script setup>
import { computed, onMounted, watch } from 'vue';
import { useFriendsStore } from '../stores/useFriends.store.js';
import PersonCard from '@social/pages/explore/components/PersonCard.vue';

const props = defineProps({
  person: { type: Object, default: () => ({}) },
  isMe: { type: Boolean, default: false },
  personId: { type: String, default: null }
});

const friendsStore = useFriendsStore();

const load = (id) => {
  if (!id) return;
  friendsStore.fetchFriends(id);
  if (props.isMe) friendsStore.fetchRequests(id);
};

onMounted(() => load(props.personId));
watch(() => props.personId, load);

// Solicitudes pendientes que aún no son amigos
const activeRequests = computed(() =>
  (friendsStore.requests || []).filter((r) => r.has_pending_request_from === true)
);

// Amigos ya aceptados (is_friend o vienen del endpoint /friends)
const activeFriends = computed(() => friendsStore.friends || []);
</script>

<template>
  <div class="profile-tabs-container pt-1 pb-6 space-y-8">
    <!-- Loader -->
    <div v-if="friendsStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
    </div>

    <template v-else>
      <!-- Solicitudes (solo para el dueño) -->
      <section v-if="isMe && activeRequests.length > 0">
        <div class="profile-section-header">
          <h3 class="profile-section-title">Solicitudes de amistad</h3>
          <span
            class="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
          >
            {{ activeRequests.length }}
          </span>
        </div>
        <div class="profile-cards-grid pt-1">
          <PersonCard
            v-for="request in activeRequests"
            :key="request.id"
            :person="request"
            @accept-request="friendsStore.acceptRequest(request)"
            @reject-request="friendsStore.rejectRequest(request)"
          />
        </div>
      </section>

      <!-- Amigos -->
      <section v-if="activeFriends.length > 0">
        <div class="profile-section-header">
          <h3 class="profile-section-title">
            {{ isMe ? 'Mis amigos' : 'Amigos' }}
          </h3>
          <span class="ml-2 text-sm text-text-muted font-normal">{{ activeFriends.length }}</span>
        </div>
        <div class="profile-cards-grid">
          <PersonCard
            v-for="friend in activeFriends"
            :key="friend.id"
            :person="friend"
            @remove-friend="friendsStore.removeFriend(friend)"
          />
        </div>
      </section>

      <!-- Vacío -->
      <div
        v-if="activeFriends.length === 0 && !(isMe && activeRequests.length > 0)"
        class="py-16 text-center"
      >
        <p class="text-sm text-text-muted">No hay amigos que mostrar.</p>
      </div>
    </template>
  </div>
</template>
