<script setup>
import { onMounted, watch } from 'vue';
import { usePublicationsStore } from '../stores/usePublications.store.js';
import ProfileStats from '@social/pages/profile/components/ProfileStats.vue';
import PostComposer from '@social/pages/feed/components/PostComposer.vue';
import PostCard from '@social/pages/feed/components/PostCard.vue';

const props = defineProps({
  person: { type: Object, default: () => ({}) },
  isMe: { type: Boolean, default: false },
  personId: { type: String, default: null }
});

const emit = defineEmits(['openEdit']);

const publicationsStore = usePublicationsStore();

// Fetch posts cuando se monta el componente
onMounted(() => {
  if (props.personId) {
    publicationsStore.fetchPosts(props.personId);
  }
});

// Refetch si cambia el personId (edge case)
watch(
  () => props.personId,
  (newId) => {
    if (newId) {
      publicationsStore.fetchPosts(newId);
    }
  }
);

// Handler cuando se crea un post desde PostComposer
const handlePostCreated = (post) => {
  if (post) {
    publicationsStore.addPost(post);
  }
};

// Handler para eliminar post
const handlePostDeleted = (postId) => {
  publicationsStore.removePost(postId);
};
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4 items-start">
    <!-- Sidebar izquierdo: stats / info rápida -->
    <div class="w-full lg:w-1/3 flex-shrink-0 lg:sticky lg:top-20">
      <ProfileStats
        :person="person"
        :is-me="isMe"
        :person-id="personId"
        :post-count="publicationsStore.posts.length"
        @open-edit="emit('openEdit')"
      />
    </div>

    <!-- Feed de publicaciones -->
    <div class="w-full lg:w-2/3 flex flex-col gap-4">
      <!-- Loader -->
      <div v-if="publicationsStore.isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>

      <!-- Composer + Posts -->
      <template v-else>
        <PostComposer v-if="isMe" :margin="false" @post-created="handlePostCreated" />

        <!-- 
          Posts usan postStore directamente (single source of truth)
          No necesitamos pasar eventos, PostCard maneja todo internamente
        -->
        <PostCard
          v-for="post in publicationsStore.posts"
          :key="post.id"
          :post="post"
          @deleted="handlePostDeleted"
        />

        <div v-if="!publicationsStore.posts.length" class="py-12 text-center soc-card">
          <p class="text-gray-500">No hay publicaciones aún.</p>
        </div>
      </template>
    </div>
  </div>
</template>
