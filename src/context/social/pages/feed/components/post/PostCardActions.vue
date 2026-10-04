<script setup>
import { computed } from 'vue';
import { ThumbsUp, MessageCircle, Share } from '@lucide/vue';

const props = defineProps({
  post: { type: Object, required: true },
  commentsOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['like', 'toggle-comments', 'show-reactions']);

const likesCount = computed(() => props.post.likes_count || 0);
const commentsCount = computed(() => props.post.comments_count || 0);
const hasLiked = computed(() => props.post.viewer_has_liked || false);

const handleLike = () => {
  emit('like');
};

const handleToggleComments = () => {
  emit('toggle-comments');
};

const handleShowReactions = () => {
  emit('show-reactions');
};
</script>

<template>
  <div class="border-t border-gray-100 dark:border-gray-800">
    <!-- Contadores -->
    <div
      v-if="likesCount > 0 || commentsCount > 0"
      class="flex items-center justify-between px-4 py-2 text-sm text-gray-500 dark:text-gray-400"
    >
      <button v-if="likesCount > 0" @click="handleShowReactions" class="hover:underline transition-all">
        {{ likesCount }} {{ likesCount === 1 ? 'me gusta' : 'me gusta' }}
      </button>
      <button v-if="commentsCount > 0" @click="handleToggleComments" class="hover:underline transition-all">
        {{ commentsCount }}
        {{ commentsCount === 1 ? 'comentario' : 'comentarios' }}
      </button>
    </div>

    <!-- Botones de  -->
    <div class="flex items-center border-t border-gray-100 dark:border-gray-800">
      <!-- Like -->
      <button
        @click="handleLike"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg mx-1"
        :class="{
          'text-emerald-600 dark:text-emerald-400 font-medium': hasLiked
        }"
      >
        <ThumbsUp :size="18" :class="{ 'fill-current': hasLiked }" />
        <span class="text-sm font-medium">Me gusta</span>
      </button>

      <!-- Comentar -->
      <button
        @click="handleToggleComments"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg mx-1"
        :class="{ 'text-emerald-600 dark:text-emerald-400': commentsOpen }"
      >
        <MessageCircle :size="18" />
        <span class="text-sm font-medium">Comentar</span>
      </button>

      <!-- Compartir -->
      <button
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg mx-1"
      >
        <Share :size="18" />
        <span class="text-sm font-medium">Compartir</span>
      </button>
    </div>
  </div>
</template>
