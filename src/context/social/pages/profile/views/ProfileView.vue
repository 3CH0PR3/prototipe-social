<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../user/stores/useUser.store.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';
import { profileService } from '../services/profile.service';

// New components
import ProfileHeader from '../components/ProfileHeader.vue';
import ProfileTabs from '../components/ProfileTabs.vue';
import ProfileAbout from '../components/ProfileAbout.vue';
import ProfileFriends from '../components/ProfileFriends.vue';
import ProfilePublications from '../components/ProfilePublications.vue';
import ProfilePrivacyModal from '../components/ProfilePrivacyModal.vue';

const route = useRoute();
const authStore = useUserStore();
const friendshipStore = useFriendshipStore();

// State
const activeTab = ref('publications');
const profile = ref(null);
const isLoading = ref(true);
const showPrivacyModal = ref(false);

// Computed
const profileId = computed(() => route.params.username || route.params.id);
const isOwnProfile = computed(() => {
  if (!profile.value || !authStore.user) return false;
  return authStore.user.id === profile.value.id || authStore.user.id === profile.value.social_user_id;
});

// Methods
const loadProfile = async () => {
  if (!profileId.value) return;

  try {
    isLoading.value = true;
    const response = await profileService.fetchUser(profileId.value);
    profile.value = response.data;
  } catch (error) {
    console.error('Error loading profile:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleAddFriend = async () => {
  if (!profile.value) return;

  try {
    await friendshipStore.sendRequest(profile.value.id);
    // Reload profile to get updated friendship status
    await loadProfile();
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
};

const handleTabChange = (newTab) => {
  activeTab.value = newTab;
};

const handleMessage = () => {
};

const handleUpdateAvatar = () => {
};

const handleUpdateCover = () => {
};

const handlePrivacyUpdated = (newPrivacyLevel) => {
  if (profile.value) {
    profile.value.privacy_level = newPrivacyLevel;
  }
};

const handleTabChange = (newTab) => {
  console.log('Tab change received in ProfileView:', newTab);
  activeTab.value = newTab;
};

// Lifecycle
onMounted(() => {
  loadProfile();
});

watch(
  () => profileId.value,
  () => {
    activeTab.value = 'publications';
    loadProfile();
  }
);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="animate-pulse">
      <div class="bg-gray-300 h-80 w-full"></div>
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center gap-4 -mt-16 mb-6">
          <div class="w-40 h-40 bg-gray-300 rounded-full"></div>
          <div class="flex-1">
            <div class="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div class="h-4 bg-gray-300 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="pb-8">
      <!-- Header -->
      <ProfileHeader
        :profile="profile"
        :is-own-profile="isOwnProfile"
        @add-friend="handleAddFriend"
        @send-message="handleSendMessage"
        @update-avatar="handleUpdateAvatar"
        @update-cover="handleUpdateCover"
      />

      <!-- Tabs Navigation -->
      <ProfileTabs :active-tab="activeTab" @change-tab="handleTabChange" />

      <!-- Tab Content -->
      <div class="max-w-5xl mx-auto px-4 mt-6">
        <!-- Publications Tab -->
        <div v-if="activeTab === 'publications'">
          <ProfilePublications :profile-id="profileId" />
        </div>

        <!-- About Tab -->
        <div v-else-if="activeTab === 'about'">
          <ProfileAbout :profile="profile" />
        </div>

        <!-- Friends Tab -->
        <div v-else-if="activeTab === 'friends'">
          <ProfileFriends :profile-id="profileId" />
        </div>

        <!-- Photos Tab (Placeholder) -->
        <div v-else-if="activeTab === 'photos'" class="bg-white rounded-lg shadow-sm p-12 text-center">
          <p class="text-gray-500 text-lg"> de fotos próximamente</p>
        </div>
      </div>

      <!-- Privacy Settings Button (Own Profile Only) -->
      <button
        v-if="isOwnProfile"
        type="button"
        class="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors border-0 cursor-pointer z-40"
        @click="showPrivacyModal = true"
        title=" de privacidad"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      <!-- Privacy Modal -->
      <ProfilePrivacyModal
        v-if="isOwnProfile"
        :is-open="showPrivacyModal"
        :current-privacy-level="profile.privacy_level"
        :profile-id="profile.id"
        @close="showPrivacyModal = false"
        @updated="handlePrivacyUpdated"
      />
    </div>

    <!-- Error State -->
    <div v-else class="max-w-4xl mx-auto px-4 py-12 text-center">
      <p class="text-gray-500 text-lg">No se pudo cargar el perfil</p>
    </div>
  </div>
</template>
