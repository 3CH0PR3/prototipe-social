<script setup>
import { computed } from 'vue';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';
import { useUserStore } from '../../user/stores/useUser.store.js';
import { getProfileFullName, getProfileAvatar } from '@shared/composables/useProfile';
import SubmitButton from '@shared/components/button/SubmitButton.vue';
import imgProfileDefault from '@social/assets/img/default.svg';

const props = defineProps({
  person: { type: Object, required: true }
});

const emit = defineEmits(['removeSuggestion', 'acceptRequest', 'rejectRequest', 'removeFriend']);

const friendshipStore = useFriendshipStore();
const authStore = useUserStore();

const avatarSrc = computed(() => getProfileAvatar(props.person) || imgProfileDefault);
const displayName = computed(() => getProfileFullName(props.person));
const profileLink = computed(() => ({
  name: 'social.profiles',
  params: { id: props.person.id || props.person.social_user_id }
}));

const isCurrentUser = computed(
  () => authStore.user?.id === props.person.id || authStore.user?.id === props.person.social_user_id
);

const isFriend = computed(
  () => props.person.is_friend === true || friendshipStore.getStatus(props.person.id).isFriend
);

const hasPendingRequestFrom = computed(
  () =>
    props.person.has_pending_request_from === true ||
    friendshipStore.getStatus(props.person.id).hasPendingRequestFrom
);

const hasSentPendingRequest = computed(
  () =>
    props.person.has_sent_pending_request === true ||
    friendshipStore.getStatus(props.person.id).hasSentPendingRequest
);

const mutualFriendsText = computed(() => {
  const n = props.person.mutualFriends;
  return n === 1 ? '1 amigo en común' : `${n} amigos en común`;
});
</script>

<template>
  <article class="soc-card person-card !shadow">
    <router-link :to="profileLink" class="person-card-link">
      <div class="person-card-image-wrapper">
        <img
          :src="avatarSrc"
          :alt="displayName"
          class="person-card-image"
          loading="lazy"
          @error="$event.target.src = imgProfileDefault"
        />
      </div>
    </router-link>

    <!-- Info -->
    <div class="person-card-info">
      <router-link :to="profileLink" class="person-card-name text-center" :title="displayName">
        {{ displayName }}
      </router-link>

      <!-- Subtexto -->
      <div :class="{ 'person-card-mutual': person.mutualFriends > 0 }">
        <template v-if="person.mutualFriends > 0">
          <div class="person-card-mutual-images">
            <img src="https://i.pravatar.cc/100?img=1" class="person-card-mutual-img" />
          </div>
          <span class="person-card-text">{{ mutualFriendsText }}</span>
        </template>
        <template v-else-if="isFriend">
          <span class="person-card-text-light">Amigo</span>
        </template>
        <template v-else-if="!isCurrentUser">
          <span class="person-card-text-light">Sugerencia para ti</span>
        </template>
      </div>

      <!-- Acciones -->
      <div v-if="!isCurrentUser" class="person-card-actions">
        <template v-if="isFriend">
          <button
            class="person-card-btn-secondary"
            @click="emit('removeFriend') || friendshipStore.removeFriend(person.id)"
          >
            Eliminar
          </button>
        </template>

        <template v-else-if="hasPendingRequestFrom">
          <SubmitButton
            :loading="friendshipStore.getStatus(person.id).isLoading"
            @click="emit('acceptRequest') || friendshipStore.acceptRequest(person.id)"
          >
            Confirmar
          </SubmitButton>
          <button
            class="person-card-btn-secondary"
            @click="emit('rejectRequest') || friendshipStore.cancelRequest(person.id)"
          >
            Eliminar
          </button>
        </template>

        <template v-else-if="hasSentPendingRequest">
          <SubmitButton
            class="person-card-btn-tertiary"
            :loading="friendshipStore.getStatus(person.id).isLoading"
            @click="friendshipStore.cancelRequest(person.id)"
          >
            Cancelar solicitud
          </SubmitButton>
        </template>

        <template v-else>
          <SubmitButton
            :loading="friendshipStore.getStatus(person.id).isLoading"
            @click="friendshipStore.sendRequest(person.id)"
          >
            Agregar a amigos
          </SubmitButton>
          <button class="person-card-btn-secondary" @click="emit('removeSuggestion', person.id)">
            Eliminar
          </button>
        </template>
      </div>
    </div>
  </article>
</template>
