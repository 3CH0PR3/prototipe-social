<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfileStore } from '@social/pages/profile/stores/useProfile.store.js';

import ProfileCover from '@social/pages/profile/components/ProfileCover.vue';
import ProfileTabs from '@social/pages/profile/components/ProfileTabs.vue';
import ProfileEditModal from '@social/pages/profile/components/ProfileEditModal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useUserStore();
const profileStore = useProfileStore();

const editModalOpen = ref(false);

// Mapeo tabs → rutas
const tabToRoute = {
  publications: 'social.profile.publications',
  about: 'social.profile.info',
  friends: 'social.profile.friends',
  photos: 'social.profile.photos'
};

const activeTab = computed(() => {
  const name = route.name;
  if (name === 'social.profile.info') return 'about';
  if (name === 'social.profile.friends') return 'friends';
  if (name === 'social.profile.photos') return 'photos';
  return 'publications';
});

const handleTabChange = (tabId) => {
  const routeName = tabToRoute[tabId];
  if (routeName && route.name !== routeName) {
    router.push({ name: routeName });
  }
};

const me = computed(() => authStore.user);
const personId = computed(() => me.value?.id || me.value?.username);
const person = computed(() => profileStore.currentUser || authStore.user || {});

const loadProfile = async () => {
  const id = personId.value;
  if (!id) return;
  try {
    await profileStore.fetchUser(id);
  } catch (e) {
    console.error('Error loading profile:', e);
  }
};

const handleUpdated = async () => {
  await loadProfile();
};

onMounted(loadProfile);
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 pb-20 sm:pb-0">
    <main class="w-full max-w-6xl mx-auto">
      <ProfileCover :person="person" :current-user="me" :is-me="true" @open-edit="editModalOpen = true" />

      <ProfileTabs :active-tab="activeTab" @change-tab="handleTabChange" />

      <div class="pt-4 pb-6 px-4">
        <router-view :person="person" :is-me="true" :person-id="personId" @open-edit="editModalOpen = true" />
      </div>
    </main>

    <ProfileEditModal
      v-if="person?.social_user_id || person?.id"
      :is-open="editModalOpen"
      :profile="person"
      @close="editModalOpen = false"
      @updated="handleUpdated"
    />
  </div>
</template>
