<script setup>
import PersonCard from '@social/pages/explore/components/PersonCard.vue';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  friends: { type: Array, default: () => [] },
  profileId: { type: String, default: null }
});
</script>

<template>
  <div class="profile-tabs-container p-6">
    <template v-if="friends.length > 0">
      <div class="profile-section-header">
        <h3 class="profile-section-title">Amigos</h3>
        <span class="ml-2 text-sm text-gray-400">{{ friends.length }}</span>
      </div>
      <div class="profile-cards-grid">
        <PersonCard v-for="friend in friends" :key="friend.id" :person="friend" />
      </div>
    </template>
    <div v-else class="py-16 text-center">
      <p class="text-sm text-gray-500">No hay amigos que mostrar.</p>
    </div>
  </div>
</template>
