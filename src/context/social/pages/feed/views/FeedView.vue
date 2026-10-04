<script setup>
import { ref, onMounted, watch } from 'vue';
import { useIntersectionObserver, useDocumentVisibility } from '@vueuse/core';
import { useFeedStore } from '../stores/feed.store.js';
import { ArrowUp } from '@lucide/vue';

import PostComposer from '../components/PostComposer.vue';
import PostCard from '../components/PostCard.vue';

const store = useFeedStore();
const loadMoreTrigger = ref(null);
const feedContainerRef = ref(null);

// --- TAB FOCUS AUTO REFRESH ---
const visibility = useDocumentVisibility();
let lastActiveTime = Date.now();
const showNewPostsBubble = ref(false);

watch(visibility, (current) => {
  if (current === 'hidden') {
    lastActiveTime = Date.now();
  } else if (current === 'visible') {
    // Si han pasado más de 5 minutos
    if (Date.now() - lastActiveTime > 30 * 1000) {
      const el = document.querySelector('.soc-feed-view') || document.documentElement;
      if (el.scrollTop < 100) {
        // Si está arriba, recargar de golpe
        store.fetchPosts(false, true);
      } else {
        // Mostrar burbuja flotante
        showNewPostsBubble.value = true;
      }
    }
  }
});

const scrollToTopAndRefresh = () => {
  showNewPostsBubble.value = false;
  const el = document.querySelector('.soc-feed-view') || document.documentElement;
  el.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    store.fetchPosts(false, true);
  }, 300);
};

onMounted(() => {
  store.fetchPosts();
});

useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
  if (isIntersecting && store.hasMore) {
    store.fetchPosts(true);
  }}, { rootMargin: '200px' });
</script>

<template>
  <section class="soc-feed-view" ref="feedContainerRef">
    <!-- Bubble "Nuevas publicaciones" -->
    <div 
      v-if="showNewPostsBubble" 
      class="sticky top-4 z-50 flex justify-center cursor-pointer pointer-events-none"
    >
      <button 
        @click="scrollToTopAndRefresh" 
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg font-semibold text-sm hover:bg-blue-700 pointer-events-auto transition-transform hover:-translate-y-1"
      >
        <ArrowUp :size="16" />
        Nuevas publicaciones
      </button>
    </div>

    <PostComposer />

    <template v-if="store.isLoading && !store.items.length">
      <div v-for="i in 3" :key="'skel-' + i" class="soc-feed-skeleton">
        <div class="soc-feed-skeleton__header">
          <div class="soc-feed-skeleton__avatar"></div>
          <div>
            <div class="soc-feed-skeleton__title"></div>
            <div class="soc-feed-skeleton__subtitle"></div>
          </div>
        </div>
        <div class="soc-feed-skeleton__text"></div>
        <div class="soc-feed-skeleton__text-short"></div>
        <div class="soc-feed-skeleton__image"></div>
      </div>
    </template>

    <template v-else>
      <PostCard v-for="post in store.items" :key="post.id" :post="post" />
    </template>

    <div ref="loadMoreTrigger" class="soc-feed-loader">
      <div class="soc-feed-loader__container">
        <div class="soc-feed-loader__dot" style="animation-delay: 0ms"></div>
        <div class="soc-feed-loader__dot" style="animation-delay: 150ms"></div>
        <div class="soc-feed-loader__dot" style="animation-delay: 300ms"></div>
      </div>
    </div>
  </section>
</template>

