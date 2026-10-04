<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfileStore } from '@social/shared/stores/useProfile.store.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';
import ProfileHeader from '@social/pages/profile/components/ProfileHeader.vue';
import ProfileTabs from '@social/pages/profile/components/ProfileTabs.vue';
import ProfileSkeleton from './components/skeleton/ProfileSkeleton.vue';

import { useToast } from '@shared/composables/useToast';

const route = useRoute();
const authStore = useUserStore();
const profileStore = useProfileStore();
const friendshipStore = useFriendshipStore();
const toast = useToast();

// Determinar si es perfil propio o ajeno
const profileId = computed(() => route.params.id);
const isOwnProfile = computed(() => {
  const user = authStore.user;
  if (!user || !profileId.value) return false;
  return user.id === profileId.value || user.username === profileId.value;
});

// Cargar datos del perfil
const profile = computed(() => profileStore.currentProfile || {});
const isLoading = computed(() => profileStore.isLoading);

// Preparar datos del perfil para ProfileHeader
const profileHeaderData = computed(() => {
  const p = profile.value;
  if (!p) return {};

  const pi = p.personal_information || {};
  const fullName =
    [pi.first_name || p.first_name, pi.paternal_surname || p.paternal_surname].filter(Boolean).join(' ') ||
    p.display_name ||
    p.name ||
    'Usuario';

  return {
    id: p.id || p.social_user_id,
    display_name: fullName,
    username: p.username || p.member_slug || p.slug || '',
    avatar_url: p.avatar_url || pi.avatar_url,
    cover_url: p.cover_url,
    friends_count: p.friends_count ?? 0,
    followers_count: p.followers_count,
    posts_count: p.posts_count,
    is_friend: friendshipStore.getStatus(p.social_user_id)?.isFriend || false,
    has_pending_request: friendshipStore.getStatus(p.social_user_id)?.hasSentPendingRequest || false,
    is_pending_approval: friendshipStore.getStatus(p.social_user_id)?.hasPendingRequestFrom || false
  };
});

const loadProfile = async () => {
  const id = profileId.value;

  if (!id) {
    console.error('No profile ID in URL');
    return;
  }

  try {
    profileStore.currentProfile = null;
    await profileStore.fetchProfile(id);
  } catch (e) {
    console.error('Error loading profile:', e);
  }
};

onMounted(loadProfile);

watch(profileId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadProfile();
  }
});

// Handlers para ProfileHeader
const handleAddFriend = async () => {
  const socialUserId = profile.value?.social_user_id;
  if (!socialUserId) return;

  const status = friendshipStore.getStatus(socialUserId);

  if (status.isFriend) {
    await friendshipStore.removeFriend(socialUserId);
  } else if (status.hasSentPendingRequest) {
    await friendshipStore.cancelRequest(socialUserId);
  } else if (status.hasPendingRequestFrom) {
    await friendshipStore.acceptRequest(socialUserId);
  } else {
    await friendshipStore.sendRequest(socialUserId);
  }
};

const handleSendMessage = () => {
  // TODO: Implementar navegación a mensajes
  console.log('Send message to:', profile.value?.username);
};

const handleUpdateAvatar = async (file) => {
  if (!file) return;

  const userId = profile.value?.id || profile.value?.social_user_id;
  if (!userId) {
    console.error('No user ID available');
    return;
  }

  try {
    await profileStore.uploadAvatar(userId, file);
  } catch (error) {
    console.error('Error uploading avatar:', error);
  }
};

const handleUpdateCover = async (file) => {
  if (!file) return;

  const userId = profile.value?.id || profile.value?.social_user_id;
  if (!userId) {
    console.error('No user ID available');
    return;
  }

  try {
    await profileStore.uploadCover(userId, file);
  } catch (error) {
    console.error('Error uploading cover:', error);
  }
};

const handleTogglePrivacy = () => {
  // TODO: Implementar toggle de privacidad del perfil
  console.log('Toggle privacy for profile:', profile.value?.id);
  // Aquí harías una llamada al backend para cambiar is_public
};

const handleCopyProfileLink = () => {
  const toast = useToast();
  toast.success('Enlace copiado al portapapeles');
};

const handleShareProfile = () => {
  // TODO: Implementar compartir perfil (Web Share API o modal)
  console.log('Share profile:', profile.value?.id);
  if (navigator.share) {
    const profileUrl = `${window.location.origin}/social/profiles/${profile.value?.id}`;
    navigator
      .share({
        title: `Perfil de ${profile.value?.display_name || profile.value?.username}`,
        url: profileUrl
      })
      .catch((err) => console.log('Error sharing:', err));
  }
};

const handleBlockUser = () => {
  // TODO: Implementar bloquear usuario
  console.log('Block user:', profile.value?.id);
  // Mostrar modal de confirmación y luego llamar al backend
};

const handleReportUser = () => {
  // TODO: Implementar reportar usuario
  console.log('Report user:', profile.value?.id);
  // Mostrar modal con opciones de reporte
};
</script>

<template>
  <div class="soc-profile-layout">
    <main class="soc-profile-main">
      <ProfileSkeleton v-if="isLoading" />

      <template v-else>
        <ProfileHeader
          :profile="profileHeaderData"
          :is-own-profile="isOwnProfile"
          @add-friend="handleAddFriend"
          @send-message="handleSendMessage"
          @update-avatar="handleUpdateAvatar"
          @update-cover="handleUpdateCover"
          @toggle-privacy="handleTogglePrivacy"
          @copy-profile-link="handleCopyProfileLink"
          @share-profile="handleShareProfile"
          @block-user="handleBlockUser"
          @report-user="handleReportUser"
        />

        <ProfileTabs :profile-id="profileId" />

        <div class="soc-profile-content-area">
          <router-view
            :profile="profile"
            :person="profile"
            :is-me="isOwnProfile"
            :is-own-profile="isOwnProfile"
            :person-id="isOwnProfile ? authStore.user?.id : profileId"
            :profile-id="profileId"
          />
        </div>
      </template>
    </main>
  </div>
</template>
