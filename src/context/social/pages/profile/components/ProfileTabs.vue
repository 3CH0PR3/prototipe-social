<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  profileId: { type: String, required: true }
});

const route = useRoute();
const router = useRouter();

const tabs = [
  { label: 'Todo', id: 'publications' },
  { label: 'Información', id: 'about' },
  { label: 'Amigos', id: 'friends' },
  { label: 'Fotos', id: 'photos' }
];

const activeTab = computed(() => {
  const name = route.name;
  if (name?.includes('info')) return 'about';
  if (name?.includes('friends')) return 'friends';
  if (name?.includes('photos')) return 'photos';
  return 'publications';
});

const handleTabChange = (tabId) => {
  const tabName = tabId === 'about' ? 'info' : tabId;
  const routeName = `social.profiles.${tabName}`;

  router.push({ name: routeName, params: { id: props.profileId } });
};
</script>

<template>
  <nav class="soc-profile-tabs-nav soc-card md:!rounded-t-none">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="soc-profile-tab"
      :class="{ active: activeTab === tab.id }"
      @click="handleTabChange(tab.id)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
