<script setup>
import { onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProfilesStore } from '@social/pages/profiles/stores/useProfile.store.js';
import { useProfile } from '@shared/composables/useProfile';
import PostCard from '@social/pages/feed/components/PostCard.vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { Briefcase, UserPlus, MessageCircle, UserCheck } from '@lucide/vue';

const route = useRoute();
const userStore = useUserStore();
const profilesStore = useProfilesStore();

const {
  currentProfile: profile,
  currentProfilePosts: posts,
  isProfileLoading: isLoading
} = storeToRefs(profilesStore);

const { fullName, avatar, hasAvatar, initials } = useProfile(profile);

onMounted(() => {
  profilesStore.fetchProfile(route.params.id);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      profilesStore.fetchProfile(newId);
    }
  }
);

const isSelf = computed(() => {
  if (!userStore.user || !profile.value) return false;
  return (
    userStore.user.username === profile.value.member_slug ||
    userStore.user.id === profile.value.social_user_id
  );
});

const handleAddFriend = async () => {
  if (!profile.value) return;
  // Fallback if target is undefined due to cache to warn user cleanly
  if (!profile.value.social_user_id) {
    alert(
      'Error: Por favor recarga la página (Ctrl+F5) para limpiar la caché y obtener el ID del usuario.'
    );
    return;
  }
  await profilesStore.sendFriendRequest(profile.value.social_user_id);
};
</script>

<template>
  <div class="max-w-4xl mx-auto w-full pb-20 px-4 sm:px-0">
    <div v-if="isLoading" class="animate-pulse space-y-4 mt-4">
      <div class="h-64 bg-white dark:bg-[#242526] rounded-b-lg"></div>
    </div>

    <div v-else-if="profile">
      <!-- Cover & Avatar -->
      <div class="bg-white dark:bg-[#242526] rounded-b-lg shadow-sm relative mb-4">
        <div
          class="h-64 bg-gradient-to-r from-emerald-600 to-teal-900 rounded-b-lg object-cover w-full"
        ></div>

        <div class="px-8 pb-4 flex flex-col md:flex-row items-center md:items-end gap-4 relative -mt-16">
          <div
            class="w-32 h-32 rounded-full border-4 border-white dark:border-[#18191A] bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0"
          >
            <img v-if="hasAvatar" :src="avatar" class="w-full h-full object-cover" />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold bg-gray-200 dark:bg-slate-700"
            >
              {{ initials || 'U' }}
            </div>
          </div>

          <div class="flex-1 text-center md:text-left mb-2">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              {{ fullName }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 font-medium">
              @{{ profile.slug || profile.member_slug }}
            </p>
          </div>

          <div class="flex gap-2 mb-2 w-full md:w-auto">
            <button
              v-if="!isSelf && !profile.is_friend && !profile.is_pending_friend"
              @click="handleAddFriend"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-2 rounded-md font-semibold transition-colors text-[15px]"
            >
              <UserPlus class="w-5 h-5" />
              Agregar
            </button>
            <button
              v-else-if="!isSelf && profile.is_pending_friend"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#3A3B3C] text-slate-900 dark:text-white px-4 py-2 rounded-md font-semibold transition-colors cursor-default text-[15px]"
            >
              <UserCheck class="w-5 h-5" />
              Pendiente
            </button>
            <button
              v-else-if="!isSelf && profile.is_friend"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500/10 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-md font-semibold transition-colors cursor-default text-[15px]"
            >
              <UserCheck class="w-5 h-5" />
              Amigos
            </button>
            <button
              v-if="!isSelf"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-slate-900 dark:text-white px-4 py-2 rounded-md font-semibold transition-colors text-[15px]"
            >
              <MessageCircle class="w-5 h-5" />
              Mensaje
            </button>
            <button
              v-if="isSelf"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-slate-900 dark:text-white px-4 py-2 rounded-md font-semibold transition-colors text-[15px]"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-t border-gray-200 dark:border-[#3E4042] flex px-4">
          <div class="px-4 py-4 text-[#1877F2] border-b-[3px] border-[#1877F2] font-semibold cursor-pointer">
            Publicaciones
          </div>
          <div
            class="px-4 py-4 text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] font-semibold cursor-pointer rounded-md my-1 transition-colors"
          >
            Información
          </div>
          <div
            class="px-4 py-4 text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] font-semibold cursor-pointer rounded-md my-1 transition-colors"
          >
            Amigos
          </div>
        </div>
      </div>

      <!-- Body Layout -->
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-1/3 space-y-4">
          <div
            class="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-transparent"
          >
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Detalles</h2>
            <p
              v-if="profile.bio"
              class="text-center text-slate-700 dark:text-[#E4E6EB] mb-4 pb-4 border-b border-gray-200 dark:border-[#3E4042]"
            >
              {{ profile.bio }}
            </p>
            <p
              v-else
              class="text-center text-gray-400 italic mb-4 pb-4 border-b border-gray-200 dark:border-[#3E4042]"
            >
              Sin biografía
            </p>

            <div class="space-y-3">
              <div class="flex items-center gap-3 text-gray-600 dark:text-[#B0B3B8]">
                <Briefcase class="w-5 h-5 text-gray-400 dark:text-[#8C939D]" />
                <span>
                  Trabaja en
                  <span class="text-slate-900 dark:text-white font-semibold">
                    {{ profile.company_name || 'Sin especificar' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar: Posts -->
        <div class="w-full md:w-2/3 space-y-4">
          <div
            v-if="posts.length === 0"
            class="bg-white dark:bg-[#242526] rounded-xl p-8 text-center text-gray-500 dark:text-[#B0B3B8] shadow-sm border border-gray-100 dark:border-transparent"
          >
            No hay publicaciones aún.
          </div>
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold text-gray-500">Perfil no encontrado</h2>
    </div>
  </div>
</template>
