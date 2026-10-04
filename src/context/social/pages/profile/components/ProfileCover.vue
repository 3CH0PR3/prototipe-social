<script setup>
import { computed, ref } from 'vue';
import { Camera, Edit3, MoreHorizontal } from '@lucide/vue';
import { useProfileStore } from '../stores/useProfile.store.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';

const friendshipStore = useFriendshipStore();

const props = defineProps({
  person: Object,
  currentUser: Object,
  isMe: Boolean
});

const emit = defineEmits(['openEdit']);
const store = useProfileStore();
const requested = ref(false);

const fullName = computed(
  () => props.person?.display_name || props.person?.name || props.currentUser?.name || 'U'
);
const computedAvatarUrl = computed(
  () =>
    props.person?.avatar_url ||
    props.currentUser?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.value)}&background=random`
);
const computedCoverStyle = computed(() => {
  const url = props.person?.cover_url || props.currentUser?.cover_url;
  return url
    ? { backgroundImage: `url(${url})` }
    : { background: 'linear-gradient(to right, #d1d5db, #f3f4f6)' };
});

const coverInput = ref(null);
const avatarInput = ref(null);

const triggerCoverUpload = () => {
  if (props.isMe && coverInput.value) {
    coverInput.value.click();
  }
};

const triggerAvatarUpload = () => {
  if (props.isMe && avatarInput.value) {
    avatarInput.value.click();
  }
};

const onCoverSelected = async (event) => {
  const file = event.target.files[0];
  if (file && props.currentUser) {
    try {
      await store.uploadCover(props.currentUser.id, file);
    } catch (e) {
      console.error(e);
    }
  }
};

const onAvatarSelected = async (event) => {
  const file = event.target.files[0];
  if (file && props.currentUser) {
    try {
      await store.uploadAvatar(props.currentUser.id, file);
    } catch (e) {
      console.error(e);
    }
  }
};
</script>

<template>
  <div class="soc-profile-cover-wrap">
    <div class="soc-profile-cover" :style="computedCoverStyle">
      <button v-if="isMe" type="button" class="soc-profile-cover-btn" @click="triggerCoverUpload">
        <Camera :size="15" />
        Editar portada
      </button>
      <input type="file" ref="coverInput" accept="image/*" class="hidden" @change="onCoverSelected" />
    </div>

    <div class="soc-profile-header">
      <div class="soc-profile-header-inner">
        <div class="soc-profile-info">
          <div class="relative group cursor-pointer" @click="isMe ? triggerAvatarUpload() : null">
            <img class="soc-profile-avatar" :src="computedAvatarUrl" :alt="fullName" />
            <div
              v-if="isMe"
              class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera :size="24" class="text-white" />
            </div>
            <input type="file" ref="avatarInput" accept="image/*" class="hidden" @change="onAvatarSelected" />
          </div>

          <div class="soc-profile-text-wrap">
            <h1 class="soc-profile-name">
              {{ fullName }}
              <!-- <span v-if="isMe" class="soc-profile-badge">Mi cuenta</span> -->
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ person?.location || currentUser?.location }} ·
              <span class="font-medium">
                {{ isMe ? currentUser?.friends_count || '0' : person?.friends_count || '0' }} amigos
              </span>
            </p>
          </div>
        </div>

        <div class="soc-profile-actions">
          <button v-if="isMe" @click="emit('openEdit')" class="soc-btn-profile-primary !rounded !py-1 !px-3">
            <Edit3 :size="18" />
            Editar perfil
          </button>

          <template v-else>
            <!-- El ID del perfil visitado (no el usuario autenticado) -->
            <button
              v-if="friendshipStore.getStatus(person?.id).isFriend"
              @click="friendshipStore.removeFriend(person?.id)"
              :disabled="friendshipStore.getStatus(person?.id).isLoading"
              class="soc-btn-profile-secondary bg-red-100 text-red-700 hover:bg-red-200"
            >
              {{ friendshipStore.getStatus(person?.id).isLoading ? 'Cargando...' : 'Eliminar amigo' }}
            </button>

            <button
              v-else-if="friendshipStore.getStatus(person?.id).hasSentPendingRequest"
              @click="friendshipStore.cancelRequest(person?.id)"
              :disabled="friendshipStore.getStatus(person?.id).isLoading"
              class="soc-btn-profile-secondary bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {{ friendshipStore.getStatus(person?.id).isLoading ? 'Cargando...' : 'Cancelar Solicitud' }}
            </button>

            <button
              v-else-if="friendshipStore.getStatus(person?.id).hasPendingRequestFrom"
              @click="friendshipStore.acceptRequest(person?.id)"
              :disabled="friendshipStore.getStatus(person?.id).isLoading"
              class="soc-btn-profile-secondary bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {{ friendshipStore.getStatus(person?.id).isLoading ? 'Cargando...' : 'Aceptar Solicitud' }}
            </button>

            <button
              v-else
              @click="friendshipStore.sendRequest(person?.id)"
              :disabled="friendshipStore.getStatus(person?.id).isLoading"
              class="soc-btn-profile-secondary bg-green-600 text-white hover:bg-green-700 shadow-green-200"
            >
              {{ friendshipStore.getStatus(person?.id).isLoading ? 'Cargando...' : 'Agregar a amigos' }}
            </button>
          </template>

          <button class="soc-btn-profile-icon">
            <MoreHorizontal :size="20" />
          </button>
        </div>
      </div>

      <p v-if="false" class="soc-profile-bio">
        {{
          person?.bio ||
          currentUser?.bio ||
          'Construyendo espacios donde las ideas encuentran personas y las conversaciones se convierten en .'
        }}
      </p>
    </div>
  </div>
</template>
