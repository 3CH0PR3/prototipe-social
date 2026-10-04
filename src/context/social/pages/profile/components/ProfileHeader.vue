<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  UserPlus,
  UserCheck,
  MessageCircle,
  MoreHorizontal,
  Edit3,
  Camera,
  Lock,
  Globe,
  Link2,
  Share2,
  Ban,
  Flag,
  Building2
} from '@lucide/vue';

const props = defineProps({
  profile: { type: Object, required: true },
  isOwnProfile: { type: Boolean, default: false }
});

const emit = defineEmits([
  'add-friend',
  'send-message',
  'update-avatar',
  'update-cover',
  'toggle-privacy',
  'copy-profile-link',
  'share-profile',
  'block-user',
  'report-user'
]);

const router = useRouter();
const showPrivacyMenu = ref(false);
const avatarInput = ref(null);
const coverInput = ref(null);

const fullName = computed(() => props.profile.display_name || props.profile.name || props.profile.username);
const avatarUrl = computed(
  () => props.profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.value)}`
);
const username = computed(() => props.profile.username || '');

const coverStyle = computed(() => {
  const url = props.profile.cover_url;
  return url
    ? { backgroundImage: `url(${url})` }
    : { background: 'linear-gradient(to right, #059669, #0f766e)' };
});

const friendshipStatus = computed(() => {
  if (props.profile.is_friend) return 'friends';
  if (props.profile.has_pending_request) return 'pending';
  if (props.profile.is_pending_approval) return 'approval';
  return 'none';
});

const isPublicProfile = computed(() => props.profile.is_public ?? true);

const togglePrivacy = () => {
  emit('toggle-privacy');
  showPrivacyMenu.value = false;
};

const copyProfileLink = () => {
  const profileUrl = `${window.location.origin}/social/profiles/${props.profile.id}`;
  navigator.clipboard.writeText(profileUrl);
  emit('copy-profile-link');
  showPrivacyMenu.value = false;
};

const shareProfile = () => {
  emit('share-profile');
  showPrivacyMenu.value = false;
};

const blockUser = () => {
  emit('block-user');
  showPrivacyMenu.value = false;
};

const reportUser = () => {
  emit('report-user');
  showPrivacyMenu.value = false;
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const triggerCoverUpload = () => {
  coverInput.value?.click();
};

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    emit('update-avatar', file);
  }
};

const handleCoverChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    emit('update-cover', file);
  }
};


</script>

<template>
  <div class="soc-profile-cover-wrap">
    <input
      v-if="isOwnProfile"
      ref="coverInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleCoverChange"
    />

    <div class="soc-profile-cover relative group" :style="coverStyle">
      <template v-if="isOwnProfile">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
        <button
          @click="triggerCoverUpload"
          type="button"
          class="absolute bottom-3 z-40 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 border-0 cursor-pointer"
        >
          <Camera :size="14" />
          <span>Editar portada</span>
        </button>
      </template>
    </div>

    <div class="soc-profile-header">
      <div class="soc-profile-header-inner">
        <div class="soc-profile-info">
          <input
            v-if="isOwnProfile"
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />

          <button
            v-if="isOwnProfile"
            @click="triggerAvatarUpload"
            type="button"
            class="relative w-fit group border-0 bg-transparent p-0 cursor-pointer"
          >
            <img class="soc-profile-avatar" :src="avatarUrl" :alt="fullName" />

            <div
              class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center"
            >
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera :size="24" class="text-white" />
              </div>
            </div>
          </button>

          <img v-else class="soc-profile-avatar" :src="avatarUrl" :alt="fullName" />

          <div class="soc-profile-text-wrap">
            <h1 class="soc-profile-name">{{ fullName }}</h1>
            <p class="text-sm text-gray-500 mt-1">
              <span v-if="username">@{{ username }} ·</span>
              <span class="font-medium">{{ profile.friends_count ?? 0 }} amigos</span>
            </p>
            <div class="flex flex-wrap gap-2 mt-2" v-if="profile.companies && profile.companies.length">
              <span
                v-for="company in profile.companies"
                :key="company.id"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-medium border border-brand-200 dark:border-brand-500/20"
              >
                <Building2 class="w-3 h-3" />
                {{ company.company }}
                <span v-if="company.status === 'pending'" class="text-[10px] ml-1 opacity-75">
                  (Pendiente)
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="soc-profile-actions">
          <template v-if="isOwnProfile">
            <router-link
              :to="{ name: 'social.profiles.info', params: { id: profile.id } }"
              class="soc-btn-profile-primary flex-1 !rounded no-underline"
            >
              <Edit3 :size="16" />
              Editar perfil
            </router-link>
          </template>

          <template v-else>
            <button
              v-if="friendshipStatus === 'friends'"
              @click="emit('add-friend')"
              class="soc-btn-profile-secondary"
            >
              <UserCheck :size="16" />
              Amigos
            </button>

            <button
              v-else-if="friendshipStatus === 'pending'"
              @click="emit('add-friend')"
              class="soc-btn-profile-secondary"
            >
              Solicitud enviada
            </button>

            <button
              v-else-if="friendshipStatus === 'approval'"
              @click="emit('add-friend')"
              class="soc-btn-profile-primary"
            >
              <UserPlus :size="16" />
              Aceptar solicitud
            </button>

            <button v-else @click="emit('add-friend')" class="soc-btn-profile-primary">
              <UserPlus :size="16" />
              Agregar amigo
            </button>

            <button @click="emit('send-message')" class="soc-btn-profile-secondary">
              <MessageCircle :size="16" />
              Mensaje
            </button>
          </template>

          <div class="relative">
            <button @click="showPrivacyMenu = !showPrivacyMenu" class="soc-btn-profile-icon">
              <MoreHorizontal :size="20" />
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="showPrivacyMenu"
              @click.stop
              class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <!-- Opciones para MI PERFIL -->
              <template v-if="isOwnProfile">
                <!-- Cambiar privacidad -->
                <button
                  @click="togglePrivacy"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-0 bg-transparent cursor-pointer"
                >
                  <component :is="isPublicProfile ? Lock : Globe" :size="18" class="text-gray-500" />
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">
                      {{ isPublicProfile ? 'Hacer perfil privado' : 'Hacer perfil público' }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ isPublicProfile ? 'Solo tus amigos podrán ver' : 'Cualquiera podrá ver' }}
                    </span>
                  </div>
                </button>

                <div class="border-t border-gray-100 my-1"></div>

                <!-- Copiar enlace del perfil -->
                <button
                  @click="copyProfileLink"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-0 bg-transparent cursor-pointer"
                >
                  <Link2 :size="18" class="text-gray-500" />
                  <span class="text-sm font-medium text-gray-900">Copiar enlace del perfil</span>
                </button>

                <!-- Compartir perfil -->
                <button
                  @click="shareProfile"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-0 bg-transparent cursor-pointer"
                >
                  <Share2 :size="18" class="text-gray-500" />
                  <span class="text-sm font-medium text-gray-900">Compartir perfil</span>
                </button>
              </template>

              <!-- Opciones para OTROS PERFILES -->
              <template v-else>
                <!-- Copiar enlace del perfil -->
                <button
                  @click="copyProfileLink"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-0 bg-transparent cursor-pointer"
                >
                  <Link2 :size="18" class="text-gray-500" />
                  <span class="text-sm font-medium text-gray-900">Copiar enlace del perfil</span>
                </button>

                <!-- Compartir perfil -->
                <button
                  @click="shareProfile"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-0 bg-transparent cursor-pointer"
                >
                  <Share2 :size="18" class="text-gray-500" />
                  <span class="text-sm font-medium text-gray-900">Compartir perfil</span>
                </button>

                <div class="border-t border-gray-100 my-1"></div>

                <!-- Bloquear usuario -->
                <button
                  @click="blockUser"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left border-0 bg-transparent cursor-pointer group"
                >
                  <Ban :size="18" class="text-gray-500 group-hover:text-red-600" />
                  <span class="text-sm font-medium text-gray-900 group-hover:text-red-600">
                    Bloquear a {{ profile.username || 'usuario' }}
                  </span>
                </button>

                <!-- Reportar usuario -->
                <button
                  @click="reportUser"
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left border-0 bg-transparent cursor-pointer group"
                >
                  <Flag :size="18" class="text-gray-500 group-hover:text-red-600" />
                  <span class="text-sm font-medium text-gray-900 group-hover:text-red-600">
                    Reportar perfil
                  </span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPrivacyMenu" @click="showPrivacyMenu = false" class="fixed inset-0 z-40" />
  </div>
</template>
