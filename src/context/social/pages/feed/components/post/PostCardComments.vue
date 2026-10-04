<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import CommentThread from '../CommentThread.vue';
import MentionInput from '../MentionInput.vue';

const props = defineProps({
  post: { type: Object, required: true },
  isLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['comment', 'reply', 'like-comment', 'edit-comment', 'delete-comment']);

const userStore = useUserStore();
const { avatar, fullName } = useProfile(userStore.user);

const commentsScrollContainer = ref(null);

const comments = computed(() => props.post.comments || []);

const handleComment = (commentData) => {
  emit('comment', commentData);
};

const handleReply = (data) => {
  emit('reply', data);
};

const handleLikeComment = (comment) => {
  emit('like-comment', comment);
};

const handleEditComment = (data) => {
  emit('edit-comment', data);
};

const handleDeleteComment = (comment) => {
  emit('delete-comment', comment);
};
</script>

<template>
  <div class="border-t border-gray-100 dark:border-gray-800">
    <!-- Área de comentarios -->
    <div ref="commentsScrollContainer" class="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
      <!-- Loader -->
      <div v-if="isLoading" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>

      <!-- Lista de comentarios -->
      <template v-else>
        <CommentThread
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @reply="handleReply"
          @like="handleLikeComment"
          @edit="handleEditComment"
          @delete="handleDeleteComment"
        />

        <!-- Estado vacío -->
        <div v-if="comments.length === 0" class="text-center py-6 text-gray-500 text-sm">
          Sí el primero en comentar
        </div>
      </template>
    </div>

    <!-- Input de nuevo comentario -->
    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <div class="flex items-start gap-3">
        <img :src="avatar" :alt="fullName" class="w-8 h-8 rounded-full object-cover shrink-0" />
        <div class="flex-1">
          <MentionInput
            placeholder="Escribe un comentario..."
            :show-actions="false"
            @submit="handleComment"
          />
        </div>
      </div>
    </div>
  </div>
</template>
