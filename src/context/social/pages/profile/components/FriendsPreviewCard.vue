<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../stores/useProfile.store.js';
import { getProfileFullName, getProfileAvatar } from '@shared/composables/useProfile';
import imgProfileDefault from '@social/assets/img/default.svg';

const props = defineProps({
  personId: { type: String, default: null },
  isMe: { type: Boolean, default: false }
});

const router = useRouter();
const store = useProfileStore();

const preview = computed(() => (store.friends || []).slice(0, 9));
const total = computed(() => store.friends?.length ?? 0);

onMounted(() => {
  if (props.personId && !store.friends?.length) {
    store.fetchFriends(props.personId);
  }
});

const goToFriends = () => {
  if (props.isMe) {
    router.push({ name: 'social.profile.friends' });
  } else {
    router.push({
      name: 'social.profiles.friends',
      params: { id: props.personId }
    });
  }
};

const goToProfile = (friend) => {
  router.push({ name: 'social.profiles', params: { id: friend.id } });
};

const avatarOf = (friend) => getProfileAvatar(friend) || imgProfileDefault;
const nameOf = (friend) => getProfileFullName(friend);
</script>

<template>
  <div class="soc-card p-2 md:p-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-1">
      <div>
        <h2 class="text-md font-medium text-text-primary">Amigos</h2>
        <p class="text-sm text-text-muted">{{ total }} {{ total === 1 ? 'amigo' : 'amigos' }}</p>
      </div>
      <button
        type="button"
        class="text-sm font-semibold text-brand hover:text-brand-hover border-0 bg-transparent cursor-pointer transition-colors"
        @click="goToFriends"
      >
        Ver todos los amigos
      </button>
    </div>

    <!-- Grid 3×3 -->
    <div v-if="preview.length" class="grid grid-cols-3 gap-2 mt-3">
      <button
        v-for="friend in preview"
        :key="friend.id"
        type="button"
        class="flex flex-col items-center gap-1.5 border-0 bg-transparent cursor-pointer p-1 rounded-lg hover:bg-surface-alt transition-colors group"
        @click="goToProfile(friend)"
      >
        <img
          :src="avatarOf(friend)"
          :alt="nameOf(friend)"
          class="w-full aspect-square object-cover rounded-lg"
          @error="$event.target.src = imgProfileDefault"
        />
        <span
          class="text-xs font-medium text-text-primary text-center leading-tight line-clamp-2 group-hover:text-brand transition-colors w-full"
        >
          {{ nameOf(friend) }}
        </span>
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-else class="mt-3 py-6 text-center text-sm text-text-muted">No hay amigos para mostrar</div>
  </div>
</template>
