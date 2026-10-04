<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  X,
  ThumbsUp,
  MessageCircle,
  Share,
  FilePenLine,
  Earth,
  Users,
  Lock,
  BadgeCheck
} from '@lucide/vue';
import CommentThread from './CommentThread.vue';
import MentionInput from './MentionInput.vue';
import { useFeedStore } from '../stores/feed.store.js';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import { feedService } from '../services/feed.service.js';

const props = defineProps({
  post:   { type: Object, required: true },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const feedStore  = useFeedStore();
const userStore  = useUserStore();
const { avatar, fullName } = useProfile(userStore.user);
const authorProfile = useProfile(computed(() => props.post.author));
const commentsScrollContainer = ref(null);
const loadingComments  = ref(false);
const commentsLoaded   = ref(false);

const audienceIcons = { public: Earth, friends: Users, only_me: Lock };

const postImages = computed(() => {
  if (props.post.images?.length) return props.post.images;
  if (props.post.image) return [props.post.image];
  return [];
});

// Usa el body ya procesado del padre, o lo procesa aquí como fallback
const displayBody = computed(() => {
  if (props.post._parsedBody) return props.post._parsedBody;
  const raw = props.post.text || props.post.body || '';
  const decoded = raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi,  '&')
    .replace(/&lt;/gi,   '<')
    .replace(/&gt;/gi,   '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi,  "'")
    .replace(/\u00A0/g,  ' ')
    .replace(/ {2,}/g,   ' ')
    .trim();
  const safe = decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return safe.replace(/(https?:\/\/[^\s<>"]+)/g, (fullUrl) => {
    try {
      const { hostname } = new URL(fullUrl);
      const domain = hostname.replace(/^www\./, '');
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" title="${fullUrl}">${domain} →</a>`;
    } catch { return fullUrl; }
  });
});

const handleLike = () => feedStore.toggleLike(props.post.id);

const handleComment = (commentData) =>
  feedStore.createComment(props.post.id, commentData);

const handleReply = ({ text, mentions, parentId }) =>
  feedStore.createComment(props.post.id, { text, mentions: mentions || [], parent_comment_id: parentId });

const handleLikeComment = (comment) =>
  feedStore.toggleCommentLike(props.post.id, comment.id);

const handleEditComment = ({ commentId, text }) =>
  feedStore.updateComment(props.post.id, commentId, { body: text });

const handleDeleteComment = (comment) =>
  feedStore.deleteComment(props.post.id, comment.id);

watch(() => props.isOpen, async (isOpen) => {
  if (!isOpen) return;
  document.body.style.overflow = 'hidden';

  if (!commentsLoaded.value) {
    const hasComments =
      props.post.comments_count > 0 ||
      (props.post.comments && props.post.comments.length > 0);
    if (hasComments) {
      loadingComments.value = true;
      try {
        await feedStore.fetchComments(props.post.id);
        commentsLoaded.value = true;
      } finally {
        loadingComments.value = false;
      }
    }
  }

  await nextTick();
  if (commentsScrollContainer.value) {
    commentsScrollContainer.value.scrollTop =
      commentsScrollContainer.value.scrollHeight;
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) document.body.style.overflow = '';
});

watch(() => props.post.comments?.length, (newLen, oldLen) => {
  if (newLen > (oldLen || 0) && oldLen !== undefined) {
    nextTick(() => {
      if (commentsScrollContainer.value) {
        commentsScrollContainer.value.scrollTop =
          commentsScrollContainer.value.scrollHeight;
      }
    });
  }
});

const onKeydown = (e) => { if (e.key === 'Escape') emit('close'); };
onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="soc-lightbox-enter-active"
      enter-from-class="soc-lightbox-enter-from"
      enter-to-class="soc-lightbox-enter-to"
      leave-active-class="soc-lightbox-leave-active"
      leave-from-class="soc-lightbox-leave-from"
      leave-to-class="soc-lightbox-leave-to"
    >
      <div
        v-if="isOpen"
        class="soc-lightbox-backdrop"
        @click.self="emit('close')"
      >
        <!-- Close button -->
        <button
          class="soc-lightbox-close"
          type="button"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <X :size="22" />
        </button>

        <div class="soc-lightbox-container">

          <!-- LEFT — imagen -->
          <div class="soc-lightbox-media">
            <img
              v-if="postImages.length"
              :src="postImages[0]"
              :alt="post.text || 'Imagen de la '"
              class="soc-lightbox-image"
              referrerpolicy="no-referrer"
            />
            <div v-else class="soc-lightbox-no-image">
              Sin imagen
            </div>
          </div>

          <!-- RIGHT — panel post + comentarios -->
          <aside class="soc-lightbox-panel">

            <!-- Header del post -->
            <header class="soc-lightbox-panel-header">
              <div class="soc-lightbox-author">
                <img
                  :src="authorProfile.avatar.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorProfile.fullName.value)}`"
                  :alt="authorProfile.fullName.value"
                  class="soc-avatar-xs"
                />
                <div class="soc-lightbox-author-info">
                  <span class="flex items-center gap-1">
                    <span class="soc-lightbox-author-name">{{ authorProfile.fullName.value }}</span>
                    <!-- Insignia CEO (Verde) -->
                    <BadgeCheck v-if="post.author?.is_gea_wrc" :size="14" class="text-emerald-500 fill-emerald-500/10 shrink-0" title="Cuenta Oficial del Sistema" />
                    <!-- Insignia Empresa/Miembro (Azul) -->
                    <BadgeCheck v-else-if="['company', 'member'].includes(post.author?.type)" :size="14" class="text-blue-500 fill-blue-500/10 shrink-0" title="Cuenta Empresarial Verificada" />
                  </span>
                  <span class="soc-lightbox-author-meta">
                    {{ post.time }} ·
                    <component
                      :is="audienceIcons[post.visibility] || Earth"
                      :size="11"
                    />
                  </span>
                </div>
              </div>
            </header>

            <!-- Cuerpo del post -->
            <div
              v-if="post.text || post.body"
              class="soc-lightbox-body soc-post-body"
              v-html="displayBody"
            ></div>

            <!-- Contadores -->
            <div class="soc-lightbox-stats">
              <button
                class="soc-lightbox-action-btn"
                :class="{ 'soc-lightbox-action-btn--active': post.viewer_has_liked }"
                type="button"
                @click="handleLike"
              >
                <ThumbsUp
                  :size="17"
                  :fill="post.viewer_has_liked ? 'currentColor' : 'none'"
                />
                <span>{{ post.likes_count || 0 }}</span>
              </button>

              <span class="soc-lightbox-stat-info">
                <MessageCircle :size="15" class="opacity-60" />
                {{ post.comments_count || post.comments?.length || 0 }} comentarios
              </span>
            </div>

            <!-- Comentarios -->
            <div
              ref="commentsScrollContainer"
              class="soc-lightbox-comments"
            >
              <div v-if="loadingComments" class="soc-lightbox-loading">
                <div class="soc-lightbox-spinner"></div>
              </div>

              <template v-else-if="post.comments && post.comments.length">
                <CommentThread
                  v-for="(item, index) in post.comments"
                  :key="item.id"
                  :comment="item"
                  :post="post"
                  :isLast="index === post.comments.length - 1"
                  @reply="handleReply"
                  @like-comment="handleLikeComment"
                  @edit-comment="handleEditComment"
                  @delete-comment="handleDeleteComment"
                />
              </template>

              <div v-else-if="!loadingComments" class="soc-lightbox-empty-comments">
                <FilePenLine :size="28" class="text-gray-400" />
                <p class="soc-lightbox-empty-text">
                  Sí el primero en comentar.
                </p>
              </div>
            </div>

            <!-- Input comentario -->
            <footer class="soc-lightbox-footer">
              <MentionInput
                :avatar="avatar"
                placeholder="Escribe un comentario..."
                @submit="handleComment"
              />
            </footer>
          </aside>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
