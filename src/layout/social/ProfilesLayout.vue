<script setup>
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfilesStore } from '@social/pages/profiles/stores/useProfile.store.js';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';
import { Camera, Edit3, MoreHorizontal, UserPlus, UserCheck, MessageCircle } from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const profilesStore = useProfilesStore();
const authStore = useUserStore();
const friendshipStore = useFriendshipStore();

// El :id viene siempre en la URL para este feature
const profileId = computed(() => route.params.id);

const tabs = [
  { label: 'Publicaciones', name: 'social.profiles.publications' },
  { label: 'Información', name: 'social.profiles.info' },
  { label: 'Amigos', name: 'social.profiles.friends' },
  { label: 'Fotos', name: 'social.profiles.photos' }
];

const activeTab = computed(() => route.name);

onMounted(() => {
  const id = profileId.value;
  if (!id) return;

  // Si el ID de la URL es el usuario en sesión, redirigir a su perfil con ID
  if (authStore.user && (authStore.user.id === id || authStore.user.username === id)) {
    router.replace({
      name: 'social.profiles.publications',
      params: { id: authStore.user.id }
    });
    return;
  }

  profilesStore.fetchProfile(id);
  profilesStore.fetchProfilePosts(id);
  profilesStore.fetchProfileFriends(id);
});

watch(
  () => profileId.value,
  (newId) => {
    if (!newId) return;
    if (authStore.user && (authStore.user.id === newId || authStore.user.username === newId)) {
      router.replace({
        name: 'social.profiles.publications',
        params: { id: authStore.user.id }
      });
      return;
    }
    profilesStore.fetchProfile(newId);
    profilesStore.fetchProfilePosts(newId);
    profilesStore.fetchProfileFriends(newId);
  }
);

const profile = computed(() => profilesStore.currentProfile || {});
const posts = computed(() => profilesStore.currentProfilePosts || []);
const friends = computed(() => profilesStore.currentProfileFriends || []);
const isLoading = computed(() => profilesStore.isProfileLoading);

const isSelf = computed(
  () =>
    !!(
      authStore.user &&
      profile.value &&
      (authStore.user.id === profile.value.social_user_id ||
        authStore.user.username === profile.value.member_slug)
    )
);

const friendStatus = computed(() => friendshipStore.getStatus(profile.value?.social_user_id));

const fullName = computed(() => {
  const p = profile.value;
  if (!p) return 'Usuario';
  const pi = p.personal_information || {};
  return (
    [pi.first_name || p.first_name, pi.paternal_surname || p.paternal_surname].filter(Boolean).join(' ') ||
    p.display_name ||
    p.name ||
    'Usuario'
  );
});

const avatar = computed(
  () =>
    profile.value?.avatar_url ||
    profile.value?.personal_information?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.value)}`
);

const username = computed(
  () => profile.value?.username || profile.value?.member_slug || profile.value?.slug || ''
);

const coverStyle = computed(() => {
  const url = profile.value?.cover_url;
  return url
    ? { backgroundImage: `url(${url})` }
    : { background: 'linear-gradient(to right, #059669, #0f766e)' };
});
</script>

<template>
  <div class="soc-profile-layout">
    <main class="w-full max-w-6xl mx-auto">
      <!-- Skeleton mientras carga -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="h-52 bg-gray-200 dark:bg-gray-700 rounded-b-xl" />
        <div class="px-8 -mt-14 flex items-end gap-4 pb-4">
          <div
            class="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-900 shrink-0"
          />
          <div class="space-y-2 mb-3">
            <div class="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      <!-- Perfil cargado -->
      <template v-else>
        <!-- Cover -->
        <div class="soc-profile-cover-wrap">
          <div class="soc-profile-cover" :style="coverStyle" />

          <div class="soc-profile-header">
            <div class="soc-profile-header-inner">
              <div class="soc-profile-info">
                <img class="soc-profile-avatar" :src="avatar" :alt="fullName" />
                <div class="soc-profile-text-wrap">
                  <h1 class="soc-profile-name">{{ fullName }}</h1>
                  <p class="text-sm text-gray-500 mt-1">
                    <span v-if="username">@{{ username }} ·</span>
                    <span class="font-medium">{{ profile.friends_count ?? 0 }} amigos</span>
                  </p>
                </div>
              </div>

              <!-- Acciones de amistad -->
              <div class="soc-profile-actions">
                <template v-if="!isSelf">
                  <button
                    v-if="friendStatus.isFriend"
                    @click="friendshipStore.removeFriend(profile.social_user_id)"
                    :disabled="friendStatus.isLoading"
                    class="soc-btn-profile-secondary bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    {{ friendStatus.isLoading ? 'Cargando...' : 'Eliminar amigo' }}
                  </button>

                  <button
                    v-else-if="friendStatus.hasSentPendingRequest"
                    @click="friendshipStore.cancelRequest(profile.social_user_id)"
                    :disabled="friendStatus.isLoading"
                    class="soc-btn-profile-secondary bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {{ friendStatus.isLoading ? 'Cargando...' : 'Cancelar solicitud' }}
                  </button>

                  <button
                    v-else-if="friendStatus.hasPendingRequestFrom"
                    @click="friendshipStore.acceptRequest(profile.social_user_id)"
                    :disabled="friendStatus.isLoading"
                    class="soc-btn-profile-secondary bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {{ friendStatus.isLoading ? 'Cargando...' : 'Aceptar solicitud' }}
                  </button>

                  <button
                    v-else
                    @click="friendshipStore.sendRequest(profile.social_user_id)"
                    :disabled="friendStatus.isLoading"
                    class="soc-btn-profile-secondary bg-green-600 text-white hover:bg-green-700"
                  >
                    {{ friendStatus.isLoading ? 'Cargando...' : 'Agregar a amigos' }}
                  </button>

                  <button class="soc-btn-profile-secondary bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <MessageCircle :size="16" />
                    Mensaje
                  </button>
                </template>

                <button class="soc-btn-profile-icon">
                  <MoreHorizontal :size="20" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs de navegación -->
        <nav class="soc-profile-tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            type="button"
            class="soc-profile-tab"
            :class="{ active: activeTab === tab.name }"
            @click="router.push({ name: tab.name, params: { id: profileId } })"
          >
            {{ tab.label }}
          </button>
          <button type="button" class="soc-profile-more-btn">
            <MoreHorizontal :size="18" />
          </button>
        </nav>

        <!-- Contenido del tab activo -->
        <div class="soc-profile-tab-content">
          <router-view :profile="profile" :posts="posts" :friends="friends" :profile-id="profileId" />
        </div>
      </template>
    </main>
  </div>
</template>
