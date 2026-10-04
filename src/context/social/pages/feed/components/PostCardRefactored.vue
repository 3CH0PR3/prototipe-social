<script setup>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import { useFeedStore } from '../stores/feed.store.js';
import { feedService } from '../services/feed.service.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';

import PostCardHeader from './post/PostCardHeader.vue';
import PostCardContent from './post/PostCardContent.vue';
import PostCardActions from './post/PostCardActions.vue';
import PostCardComments from './post/PostCardComments.vue';

import SocialModal from '@layouts/social/components/SocialModal.vue';

// --- PROPS & EMITS ---
const props = defineProps({
  post: { type: Object, required: true }
});

const emit = defineEmits(['deleted', 'updated']);

// --- STORES ---
const userStore = useUserStore();
const feedStore = useFeedStore();
const friendshipStore = useFriendshipStore();

// Perfil del autor del post
const authorProfile = useProfile(computed(() => props.post.author));

// --- STATE ---
const openComments = ref(false);
const commentsLoaded = ref(false);
const loadingComments = ref(false);

const openReactions = ref(false);
const reactionsList = ref([]);
const loadingReactions = ref(false);

const showDeleteConfirm = ref(false);
const isDeleting = ref(false);

const showEditModal = ref(false);

// --- COMPUTED ---
const isOwner = computed(() => {
  const userId = userStore.user?.id;
  if (!userId) return false;
  return props.post.social_user_id === userId || props.post.author?.id === userId;
});

// --- WATCHERS ---
watch(openComments, async (isOpen) => {
  if (isOpen && !commentsLoaded.value) {
    const hasComments =
      props.post.comments_count > 0 || (props.post.comments && props.post.comments.length > 0);

    if (hasComments) {
      loadingComments.value = true;
      try {
        await feedStore.fetchComments(props.post.id);
        commentsLoaded.value = true;
      } catch (e) {
        console.error('Error loading comments:', e);
      } finally {
        loadingComments.value = false;
      }
    }
  }
});

// --- HANDLERS ---
const handleNavigateProfile = (userId) => {
  // Emit o navegar con router
  // Por ahora dejamos la lógica simple
};

const handleLike = () => {
  feedStore.toggleLike(props.post.id);
};

const handleToggleComments = () => {
  openComments.value = !openComments.value;
};

const handleComment = (commentData) => {
  feedStore.createComment(props.post.id, commentData);
};

const handleReply = ({ text, mentions, parentId }) => {
  feedStore.createComment(props.post.id, {
    text,
    mentions: mentions || [],
    parent_comment_id: parentId
  });
};

const handleLikeComment = (comment) => {
  feedStore.toggleCommentLike(props.post.id, comment.id);
};

const handleEditComment = ({ commentId, text }) => {
  feedStore.updateComment(props.post.id, commentId, { body: text });
};

const handleDeleteComment = (comment) => {
  feedStore.deleteComment(props.post.id, comment.id);
};

const handleShowReactions = async () => {
  openReactions.value = true;
  if (reactionsList.value.length > 0) return;

  loadingReactions.value = true;
  try {
    const res = await feedService.getLikes(props.post.id);
    const items = res.data?.items || [];
    reactionsList.value = items;

    // Inicializar estados de amistad
    items.forEach((item) => {
      if (item.user && !item.is_self) {
        friendshipStore.initStatus(item.user.id, {
          isFriend: item.is_friend,
          hasPendingRequestFrom: false,
          hasSentPendingRequest: false
        });
      }
    });
  } catch (error) {
    console.error('Error loading reactions:', error);
  } finally {
    loadingReactions.value = false;
  }
};

const handleEdit = () => {
  showEditModal.value = true;
};

const handleDelete = () => {
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    await feedStore.deletePost(props.post.id);
    showDeleteConfirm.value = false;
    emit('deleted', props.post.id);
  } catch (e) {
    console.error('Error deleting post:', e);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <article class="soc-card">
    <!-- Header: autor, timestamp, menú contextual -->
    <PostCardHeader
      :post="post"
      :author="authorProfile"
      :is-owner="isOwner"
      @edit="handleEdit"
      @delete="handleDelete"
      @navigate-profile="handleNavigateProfile"
    />

    <!-- Contenido: texto, imágenes, links -->
    <PostCardContent :post="post" />

    <!-- Acciones: like, comentar, compartir -->
    <PostCardActions
      :post="post"
      :comments-open="openComments"
      @like="handleLike"
      @toggle-comments="handleToggleComments"
      @show-reactions="handleShowReactions"
    />

    <!-- Comentarios (condicional) -->
    <PostCardComments
      v-if="openComments"
      :post="post"
      :is-loading="loadingComments"
      @comment="handleComment"
      @reply="handleReply"
      @like-comment="handleLikeComment"
      @edit-comment="handleEditComment"
      @delete-comment="handleDeleteComment"
    />

    <!-- Modal de  de  -->
    <SocialModal :is-open="showDeleteConfirm" title="Eliminar " @close="showDeleteConfirm = false">
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar esta ? Esta  no se puede deshacer.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :disabled="isDeleting"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </SocialModal>

    <!-- Modal de reacciones -->
    <SocialModal :is-open="openReactions" title="Reacciones" @close="openReactions = false">
      <div class="space-y-2">
        <div v-if="loadingReactions" class="flex justify-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
        </div>

        <div v-else-if="reactionsList.length === 0" class="text-center py-6 text-gray-500">
          No hay reacciones aún
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="reaction in reactionsList"
            :key="reaction.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <img
              :src="reaction.user?.avatar_url || reaction.user?.avatar"
              :alt="reaction.user?.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ reaction.user?.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ reaction.created_at_human || 'ahora' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SocialModal>

    <!-- TODO: Modal de  - implementar si es necesario -->
    <!-- Por ahora dejamos el placeholder -->
  </article>
</template>
