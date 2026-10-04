<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  MessageCircle,
  MoreHorizontal,
  ThumbsUp,
  Share,
  Pencil,
  Trash2,
  BellOff,
  UserPlus,
  X,
  Flag,
  Image as ImageIcon,
  Link2,
  Earth,
  Users,
  Lock,
  ChevronDown,
  FilePenLine,
  BadgeCheck
} from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import { useFeedStore } from '../stores/feed.store.js';
import { feedService } from '../services/feed.service.js';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store.js';
import { onClickOutside, useIntersectionObserver } from '@vueuse/core';
import { useForm } from '@shared/composables/useForm';
import { useToast } from '@shared/composables/useToast';

import CommentThread from './CommentThread.vue';
import MentionInput from './MentionInput.vue';

import SocialModal from '@layouts/social/components/SocialModal.vue';
import PostImageModal from './PostImageModal.vue';
import PostReportModal from './PostReportModal.vue';
import PostReactionsModal from './PostReactionsModal.vue';
import PostTrashModal from './PostTrashModal.vue';
import VerificationInfoModal from '@layouts/social/components/VerificationInfoModal.vue';
import TextInput from '@/shared/components/form/TextInput.vue';
import TextareaInput from '@/shared/components/form/TextareaInput.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';

const props = defineProps({ post: { type: Object, required: true } });
const emit = defineEmits(['deleted', 'updated']);

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const feedStore = useFeedStore();
const friendshipStore = useFriendshipStore();

const { avatar, firstName, fullName } = useProfile(userStore.user);

// Computed para datos del autor del post
const authorName = computed(() => props.post.author?.name || 'Usuario');
const authorAvatar = computed(() => 
  props.post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName.value)}`
);
const authorFirstName = computed(() => {
  if (props.post.author?.personal_information?.first_name) {
    return props.post.author.personal_information.first_name.split(' ')[0];
  }
  return props.post.author?.name?.split(' ')[0] || 'Usuario';
});

// Navegar al perfil
const goToProfile = (userId) => {
  if (!userId) return;
  // Si es el usuario GEA-WRC, mandarlo al perfil exclusivo
  if (props.post.author?.id === userId && props.post.author?.is_gea_wrc) {
    router.push({ name: 'social.system-profile' });
    return;
  }
  router.push({ name: 'social.profiles', params: { id: userId } });
};

const isVerificationModalOpen = ref(false);
const verificationType = ref('company');

const openVerificationInfo = (type) => {
  verificationType.value = type;
  isVerificationModalOpen.value = true;
};

const handleComment = (commentData) => {
  // commentData es { text, mentions: [{id, name}] }
  feedStore.createComment(props.post.id, commentData);
};

const handleReply = ({ text, mentions, parentId }) => {
  feedStore.createComment(props.post.id, {
    text,
    mentions: mentions || [],
    parent_comment_id: parentId
  });
};

const handleLike = () => {
  feedStore.toggleLike(props.post.id);
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

// --- ALGORITMO DE TRACKING DE VISTAS ---
const postCardRef = ref(null);
let viewStartTime = 0;

useIntersectionObserver(
  postCardRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      viewStartTime = Date.now();
    } else {
      if (viewStartTime > 0) {
        const duration = Date.now() - viewStartTime;
        if (duration > 1500 && props.post.id) {
          feedService.storeView(props.post.id, duration).catch(() => {});
        }
        viewStartTime = 0;
      }
    }
  },
  { threshold: 0.5 }
);

// UI State
const showContextMenu = ref(false);
const contextMenuRef = ref(null);
const showImageModal = ref(false);
const showReportModal = ref(false);

// ¿Está verificado?
const isVerified = computed(() => {
  return props.post.author?.is_verified === true || props.post.author?.is_gea_wrc === true;
});

// Decodifica entidades HTML del RSS y convierte URLs en links limpios (solo dominio)
const parsedBody = computed(() => {
  const raw = props.post.text || props.post.body || '';

  // 1. Decodificar entidades HTML comunes que vienen de feeds RSS
  const decoded = raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u00A0/g, ' ') // non-breaking space literal
    .replace(/ {2,}/g, ' ') // colapsar espacios múltiples
    .trim();

  // 2. Escapar para v-html seguro
  const safe = decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // 3. Convertir URLs en links: href completo, texto = solo dominio
  return safe.replace(/(https?:\/\/[^\s<>"]+)/g, (fullUrl) => {
    try {
      const { hostname } = new URL(fullUrl);
      const domain = hostname.replace(/^www\./, '');
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" title="${fullUrl}">${domain} →</a>`;
    } catch {
      return fullUrl;
    }
  });
});

// Reactions & Comments State
const reactionsList = ref([]);
const openReactions = ref(false);
const loadingReactions = ref(false);

const openComments = ref(false);
const commentsLoaded = ref(false);
const loadingComments = ref(false);
const commentsScrollContainer = ref(null);

// Delete State
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);

// Edit Modal State
const editForm = useForm({
  body: '',
  visibility: 'public',
  link: '',
  images: []
});

const showEditModal = ref(false);
const editShowLinkInput = ref(false);
const editLinkError = ref(false);
const editFileInput = ref(null);
const editTextarea = ref(null);

const audienceOptions = {
  public: { label: 'Público', icon: Earth },
  friends: { label: 'Amigos', icon: Users },
  only_me: { label: 'Solo yo', icon: Lock }
};

// --- 4. COMPUTED ---
const isOwner = computed(() => {
  const userId = userStore.user?.id;
  return userId && ((post) => post.social_user_id === userId || post.author?.id === userId)(props.post);
});

const editHasChanges = computed(() => {
  const originalText = props.post.text || props.post.body || '';
  const originalVis = props.post.visibility || props.post.audience || 'public';
  const originalLink = props.post.link || '';

  return (
    editForm.body !== originalText ||
    editForm.visibility !== originalVis ||
    editForm.link !== originalLink ||
    editForm.images.length > 0
  );
});

const editIsValid = computed(() => {
  const hasText = !!editForm.body.trim();
  const hasLink = !!editForm.link;
  const hasNewImages = editForm.images.length > 0;
  const hasExistingImages = !!props.post.image || (props.post.images && props.post.images.length > 0);

  return hasText || hasLink || hasNewImages || hasExistingImages;
});

// --- 5. WATCHERS ---
watch(
  () => props.post.comments?.length,
  (newLen, oldLen) => {
    if (newLen > (oldLen || 0) && oldLen !== undefined) {
      nextTick(() => {
        if (commentsScrollContainer.value) {
          commentsScrollContainer.value.scrollTop = commentsScrollContainer.value.scrollHeight;
        }
      });
    }
  }
);

watch(openComments, async (isOpen) => {
  if (isOpen && !commentsLoaded.value) {
    // Cargar comentarios si hay count > 0 O si ya hay comentarios locales (pueden ser optimistas)
    const hasComments = props.post.comments_count > 0 || (props.post.comments && props.post.comments.length > 0);

    if (hasComments) {
      loadingComments.value = true;
      try {
        await feedStore.fetchComments(props.post.id);
        commentsLoaded.value = true;
      } catch (e) {
        console.error(e);
      } finally {
        loadingComments.value = false;
      }
    }
  }
});

watch(
  () => editForm.link,
  (val) => {
    if (val) {
      try {
        new URL(val);
        editLinkError.value = false;
      } catch {
        editLinkError.value = true;
      }
    } else {
      editLinkError.value = false;
    }
  }
);

// --- 6. METHODS ---
// General
onClickOutside(contextMenuRef, () => {
  showContextMenu.value = false;
});

const submit = (text) => {
  handleComment(text);
};

// Reactions
const fetchReactions = async (forceReload = false) => {
  openReactions.value = true;
  if (reactionsList.value.length > 0 && !forceReload) return;
  loadingReactions.value = true;
  try {
    const res = await feedService.getLikes(props.post.id);
    const items = res.data?.items || [];

    reactionsList.value = items.map((item) => ({
      ...item,
      id: item.user?.id,
      social_user_id: item.user?.id,
      name: item.user?.name,
      avatar: item.user?.avatar_url,
      is_friend: item.friendship_status === 'accepted',
      is_pending_friend: item.friendship_status === 'sent',
      is_self: item.is_self
    }));

    items.forEach((item) => {
      if (item.user && !item.is_self) {
        friendshipStore.initStatus(item.user.id, {
          isFriend: item.friendship_status === 'accepted',
          hasPendingRequestFrom: item.friendship_status === 'pending',
          hasSentPendingRequest: item.friendship_status === 'sent'
        });
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    loadingReactions.value = false;
  }
};

// Edit Modal
const openEdit = () => {
  showContextMenu.value = false;
  editForm.body = props.post.text || props.post.body || '';
  editForm.visibility = props.post.visibility || props.post.audience || 'public';
  editForm.link = props.post.link || '';
  editForm.images = [];
  editShowLinkInput.value = !!editForm.link;
  showEditModal.value = true;
};

const closeEdit = () => {
  showEditModal.value = false;
  editForm.images.forEach((img) => URL.revokeObjectURL(img.preview));
  editForm.reset();
  editShowLinkInput.value = false;
  if (editTextarea.value) {
    const el = editTextarea.value.$el || editTextarea.value;
    if (el && el.style) {
      el.style.height = 'auto';
    }
  }
};

const saveEdit = async () => {
  if (!editHasChanges.value || !editIsValid.value || editForm.processing || editLinkError.value) return;
  editForm.processing = true;
  try {
    await feedStore.updatePost(props.post.id, editForm.data());
    emit('updated', props.post.id);
    closeEdit();
  } catch (e) {
    // Error handled by store
  } finally {
    editForm.processing = false;
  }
};

const autoResizeTextarea = (e) => {
  const target = e.target;
  target.style.height = 'auto';
  target.style.height = target.scrollHeight + 'px';

  const container = target.closest('.overflow-y-auto');
  if (container) {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
};

// Edit Images
const editTriggerFileSelect = () => editFileInput.value?.click();

const editHandleFileChange = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  if (editForm.images.length + files.length > 10) {
    toast.error('Puedes subir un máximo de 10 imágenes.');
    return;
  }
  files.forEach((file) => {
    if (file.type === 'image/gif') {
      toast.error('No se admiten archivos GIF.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se admiten imágenes (JPG, PNG).');
      return;
    }
    editForm.images.push({ file, preview: URL.createObjectURL(file) });
  });
  e.target.value = '';
};

const editRemoveImage = (index) => {
  URL.revokeObjectURL(editForm.images[index].preview);
  editForm.images.splice(index, 1);
};

// Delete Post
const handleDelete = async () => {
  isDeleting.value = true;
  try {
    await feedStore.deletePost(props.post.id);
    showDeleteConfirm.value = false;
    emit('deleted', props.post.id);
  } catch (e) {
    // Error handled by store
  } finally {
    isDeleting.value = false;
  }
};

// Alias para el modal
const confirmDelete = handleDelete;
</script>

<template>
  <article class="soc-card">
    <header class="soc-card-header flex items-start justify-between">
      <div class="flex items-center gap-3 border-0 bg-transparent text-inherit text-left">
        <div
          class="border border-green-950/20 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          @click="goToProfile(post.author.id)"
        >
          <img
            :src="post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Usuario')}`"
            :alt="post.author?.name || 'Usuario'"
            class="soc-avatar-xs md:soc-avatar-sm"
          />
        </div>
        <span class="flex flex-col gap-0">
          <span class="flex items-center gap-1">
            <b
              class="text-gray-900 text-xs md:text-sm font-semibold leading-3 cursor-pointer hover:underline"
              @click="goToProfile(post.author.id)"
            >
              {{ post.author?.name || 'Usuario' }}
            </b>
            <!-- Insignia CEO (Verde) -->
            <button
              v-if="post.author?.is_gea_wrc"
              @click.stop="openVerificationInfo('gea_wrc')"
              class="p-0 text-emerald-500 fill-emerald-500/10 shrink-0 cursor-pointer hover:scale-110 transition-transform bg-transparent border-0"
              title="Cuenta Oficial del Sistema"
            >
              <BadgeCheck :size="14" />
            </button>
            <!-- Insignia Empresa/Miembro (Azul) -->
            <button
              v-else-if="post.author?.is_verified && ['company', 'member'].includes(post.author?.type)"
              @click.stop="openVerificationInfo(post.author?.type)"
              class="p-0 text-blue-500 fill-blue-500/10 shrink-0 cursor-pointer hover:scale-110 transition-transform bg-transparent border-0"
              title="Cuenta Empresarial Verificada"
            >
              <BadgeCheck :size="14" />
            </button>
          </span>
          <span class="text-gray-500 text-[10px] md:text-xs flex items-center gap-1">
            {{ post.time }} ·
            <component
              :is="audienceOptions[post.visibility]?.icon || Earth"
              :size="10"
              class="cursor-help"
              :title="audienceOptions[post.visibility]?.label || 'Público'"
            />
          </span>
        </span>
      </div>
      <div ref="contextMenuRef" class="relative">
        <button
          class="soc-btn-icon"
          type="button"
          aria-label="Más opciones"
          @click="showContextMenu = !showContextMenu"
        >
          <MoreHorizontal :size="18" />
        </button>

        <!-- Context Menu Dropdown -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showContextMenu"
            class="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          >
            <template v-if="isOwner">
              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-left border-0 bg-transparent text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                @click="openEdit"
              >
                <Pencil :size="18" class="text-gray-500 shrink-0" />
                <span class="text-xs md:text-sm font-semibold">Editar publicación</span>
              </button>

              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-left border-0 bg-transparent text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                @click="showContextMenu = false"
              >
                <BellOff :size="18" class="text-gray-500 shrink-0" />
                <span class="flex flex-col">
                  <span class="text-xs md:text-sm font-semibold leading-tight">Desactivar notificaciones</span>
                  <span class="text-[10px] md:text-xs text-gray-400 leading-tight">de esta publicación</span>
                </span>
              </button>

              <div class="my-1 mx-3 border-t border-gray-100"></div>

              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-left border-0 bg-transparent text-gray-700 hover:bg-red-50 transition-colors cursor-pointer group"
                @click="
                  showContextMenu = false;
                  showDeleteConfirm = true;
                "
              >
                <Trash2 :size="18" class="text-gray-500 group-hover:text-rose-600 shrink-0 transition-colors" />
                <span class="flex flex-col">
                  <span
                    class="text-xs md:text-sm font-semibold leading-tight group-hover:text-rose-600 transition-colors"
                  >
                    Mover a la papelera
                  </span>
                  <span class="text-[10px] md:text-xs text-gray-400 leading-tight">
                    Los elementos se eliminan después de 30 días.
                  </span>
                </span>
              </button>
            </template>

            <template v-else>
              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-left border-0 bg-transparent text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                @click="showContextMenu = false"
              >
                <BellOff :size="18" class="text-gray-500 shrink-0" />
                <span class="flex flex-col">
                  <span class="text-xs md:text-sm font-semibold leading-tight">Desactivar notificaciones</span>
                  <span class="text-[10px] md:text-xs text-gray-400 leading-tight">de esta publicación</span>
                </span>
              </button>

              <div class="my-1 mx-3 border-t border-gray-100"></div>

              <button
                class="flex items-center gap-3 w-full px-4 py-2.5 text-left border-0 bg-transparent text-gray-700 hover:bg-red-50 transition-colors cursor-pointer group"
                @click="
                  showContextMenu = false;
                  showReportModal = true;
                "
              >
                <Flag :size="18" class="text-gray-500 group-hover:text-rose-600 shrink-0 transition-colors" />
                <span class="flex flex-col">
                  <span
                    class="text-xs md:text-sm font-semibold leading-tight group-hover:text-rose-600 transition-colors"
                  >
                    Reportar publicación
                  </span>
                  <span class="text-[10px] md:text-xs text-gray-400 leading-tight">
                    Ayúdanos a mantener la comunidad
                  </span>
                </span>
              </button>
            </template>
          </div>
        </Transition>
      </div>
    </header>

    <div v-if="post.text || post.tags?.length" class="soc-card-body">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="soc-text-body soc-post-body whitespace-pre-wrap break-words" v-html="parsedBody"></p>
      <div class="flex flex-wrap gap-2 mb-4" v-if="!post.tags && post.tags.length">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Multiple Images Grid -->
    <div
      v-if="post.images && post.images.length > 0"
      :class="[
        'grid gap-0.5 border-y border-gray-100',
        {
          'grid-cols-1': post.images.length === 1,
          'grid-cols-2': post.images.length > 1 && post.images.length < 5,
          'grid-cols-3': post.images.length >= 5
        }
      ]"
    >
      <button
        v-for="(img, idx) in post.images"
        :key="idx"
        class="block w-full border-0 bg-transparent p-0 cursor-zoom-in overflow-hidden relative"
        :class="post.images.length > 1 ? 'aspect-square' : ''"
        type="button"
        @click="showImageModal = true"
      >
        <img
          class="block w-full h-full object-contain bg-gray-50 hover:scale-[1.02] transition-transform duration-200"
          :class="[
            post.images.length === 1 ? 'max-h-96' : '',
            post._uploading ? 'opacity-50 blur-[2px]' : ''
          ]"
          :src="post._uploading && post._localImages ? (post._localImages[idx]?.url || img.url || img) : (img.url || img)"
          alt="Imagen de la publicación"
        />
        <!-- Overlay de carga -->
        <div
          v-if="post._uploading"
          class="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-2 px-4 py-3 bg-white/90 rounded-lg shadow-lg">
            <div class="animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-emerald-600"></div>
            <span class="text-xs font-medium text-gray-700">Procesando...</span>
          </div>
        </div>
      </button>
    </div>

    <!-- Link Preview -->
    <a
      v-if="post.link"
      :href="post.link"
      target="_blank"
      rel="noopener noreferrer"
      class="block mx-4 mb-3 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors no-underline"
    >
      <div class="text-green-700 font-bold text-sm mb-1 truncate">
        {{ post.link }}
      </div>
      <div class="text-gray-500 text-xs truncate">Haga clic para abrir el enlace externamente</div>
    </a>

    <div class="flex items-center justify-between">
      <!-- Left side: Action counts -->
      <div class="flex items-center gap-0">
        <div class="hover:bg-gray-200/40 p-1 rounded-bl-lg">
          <button
            class="flex items-center gap-1.5 ps-4 p-2 transition-all border-0 bg-transparent cursor-pointer"
            :class="post.viewer_has_liked ? 'text-blue-600' : 'text-gray-500'"
            @click="handleLike"
          >
            <ThumbsUp :size="18" :fill="post.viewer_has_liked ? 'currentColor' : 'none'" />
            <span class="select-none text-sm">{{ post.likes_count || 0 }}</span>
          </button>
        </div>

        <div class="hover:bg-gray-200/40 p-1">
          <button
            type="button"
            class="flex items-center gap-1.5 p-2 text-gray-500 border-0 bg-transparent cursor-pointer"
            @click="openComments = true"
          >
            <MessageCircle :size="18" />
            <span class="select-none text-sm">
              {{ post.comments_count || post.comments?.length || 0 }}
            </span>
          </button>
        </div>

        <div class="hover:bg-gray-200/40 p-1">
          <button
            type="button"
            class="flex items-center gap-1.5 p-2 text-gray-500 border-0 bg-transparent cursor-pointer"
          >
            <Share :size="18" />
            <span class="select-none text-sm">
              {{ post.shares_count || 0 }}
            </span>
          </button>
        </div>
      </div>

      <!-- Right side: Reactions icon only -->
      <div
        v-if="post.likes_count"
        class="flex items-center cursor-pointer pe-4 hover:opacity-80 transition-opacity"
        @click="fetchReactions"
      >
        <div class="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
          <ThumbsUp :size="10" color="white" fill="white" />
        </div>
      </div>
    </div>

    <!-- Facebook-style comments modal -->
    <SocialModal
      :title="`Publicación de ${authorFirstName}`"
      :isOpen="openComments"
      size="modal-sm"
      :scrollable="true"
      :perfectScrollbar="true"
      @close="openComments = false"
    >
      <div class="overflow-y-auto hide-scrollbar" ref="commentsScrollContainer">
        <header class="flex items-start justify-between p-4 pb-0">
          <div class="flex items-center gap-3">
            <img
              :src="authorAvatar"
              :alt="authorName"
              class="soc-avatar-xs"
            />
            <span class="flex flex-col gap-0">
              <router-link
                :to="{
                  name: 'social.profiles',
                  params: { id: post.author.id }
                }"
                class="text-gray-900 text-xs md:text-sm font-semibold leading-3 hover:underline"
              >
                {{ authorName }}
              </router-link>
              <span class="text-gray-500 text-[10px] md:text-sm flex items-center gap-1">
                {{ post.time }} ·
                <component
                  :is="audienceOptions[post.visibility]?.icon || Earth"
                  :size="10"
                  class="cursor-help"
                  :title="audienceOptions[post.visibility]?.label || 'Público'"
                />
              </span>
            </span>
          </div>
        </header>

        <p class="soc-text-body my-3 px-4 whitespace-pre-wrap break-all">
          {{ post.text }}
        </p>

        <div
          v-if="post.images && post.images.length > 0"
          class="mt-2 mb-2 grid gap-1 border-t border-gray-200"
          :class="{
            'grid-cols-1': post.images.length === 1,
            'grid-cols-2': post.images.length > 1 && post.images.length < 5,
            'grid-cols-3': post.images.length >= 5
          }"
        >
          <img
            v-for="(img, idx) in post.images"
            :key="idx"
            class="block w-full h-full object-contain bg-gray-50"
            :class="post.images.length === 1 ? 'max-h-96' : 'aspect-square'"
            :src="img"
            alt="Imagen de la publicación"
          />
        </div>

        <a
          v-if="post.link"
          :href="post.link"
          target="_blank"
          rel="noopener noreferrer"
          class="block mx-5 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors no-underline"
        >
          <div class="text-green-700 font-bold text-sm mb-1 truncate">
            {{ post.link }}
          </div>
          <div class="text-gray-500 text-xs truncate">Haga clic para abrir el enlace externamente</div>
        </a>

        <!-- Stats row inside modal -->
        <div class="flex items-center justify-between border-b border-gray-200">
          <div class="flex items-center gap-0">
            <div class="hover:bg-gray-200/40">
              <button
                class="flex items-center gap-1.5 px-4 p-2 transition-all border-0 bg-transparent cursor-pointer"
                :class="post.viewer_has_liked ? 'text-blue-600' : 'text-gray-500'"
                @click="handleLike"
              >
                <ThumbsUp :size="18" :fill="post.viewer_has_liked ? 'currentColor' : 'none'" />
                <span class="text-xs md:text-sm font-semibold">{{ post.likes_count || 0 }}</span>
              </button>
            </div>

            <div class="hover:bg-gray-200/40">
              <button
                type="button"
                class="flex items-center gap-1.5 px-4 p-2 text-gray-500 border-0 bg-transparent cursor-pointer"
              >
                <MessageCircle :size="18" />
                <span class="text-xs md:text-sm font-semibold">
                  {{ post.comments_count || post.comments?.length || 0 }}
                </span>
              </button>
            </div>
          </div>
          <div
            v-if="post.likes_count"
            class="flex items-center cursor-pointer pe-4 pb-2 hover:opacity-80 transition-opacity"
            @click="fetchReactions"
          >
            <div
              class="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm"
            >
              <ThumbsUp :size="10" color="white" fill="white" />
            </div>
          </div>
        </div>

        <div class="p-3 relative">
          <div v-if="loadingComments" class="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

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

          <div
            v-if="!loadingComments && (!post.comments || !post.comments.length)"
            class="flex py-3 items-center justify-center gap-4"
          >
            <div class="">
              <FilePenLine :size="30" class="text-gray-500" />
            </div>
            <div class="">
              <h6 class="text-text-secondary font-semibold text-sm text-center m-0">Todavía no hay comentarios</h6>
              <p class="text-gray-500 text-xs text-center">Sé la primera persona en comentar.</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <MentionInput :avatar="avatar" placeholder="Escribe un comentario... Usa @ para mencionar" @submit="submit" />
      </template>
    </SocialModal>

    <!-- Reactions Modal -->
    <PostReactionsModal
      :isOpen="openReactions"
      :loadingReactions="loadingReactions"
      :reactionsList="reactionsList"
      @close="() => {
        openReactions = false;
        reactionsList = [];
      }"
      @goToProfile="goToProfile"
    />

    <!-- Edit Post Modal -->
    <SocialModal
      title="Editar publicación"
      :isOpen="showEditModal"
      :scrollable="true"
      maxWidth="max-w-lg"
      @close="closeEdit"
    >
      <!-- Post Author info -->
      <div class="flex items-center gap-2.5 px-4 pt-4 pb-2.5 shrink-0">
        <img
          :src="post.user?.avatar || 'https://ui-avatars.com/api/?name=' + post.user?.display_name"
          :alt="post.user?.display_name"
          class="soc-avatar-sm"
        />
        <div class="flex flex-col gap-0">
          <b class="text-gray-900 text-[15px] font-bold">{{ authorName }}</b>
          <div class="relative mt-0.5 inline-block w-fit">
            <div
              class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-900 pointer-events-none"
            >
              <component :is="audienceOptions[editForm.visibility]?.icon || Earth" :size="12" />
              {{ audienceOptions[editForm.visibility]?.label || 'Público' }}
              <ChevronDown :size="12" />
            </div>
            <select v-model="editForm.visibility" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="only_me">Solo yo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Scrollable content area -->
      <div class="flex-1 overflow-y-auto flex flex-col min-h-0 hide-scrollbar px-4">
        <TextareaInput
          ref="editTextarea"
          :rows="2"
          v-model="editForm.body"
          @input="autoResizeTextarea"
          autofocus
          placeholder="¿Qué estás pensando?"
          class="w-full shrink-0 min-h-16 px-1 border-0 outline-none focus:ring-0 focus:outline-none resize-none bg-transparent text-gray-900 text-lg placeholder-gray-500 overflow-hidden"
        />

        <div v-if="editShowLinkInput" class="mb-4">
          <TextInput v-model="editForm.link" type="url" placeholder="https://ejemplo.com" :error="editLinkError" />
          <small v-if="editLinkError" class="text-red-500 text-xs mt-1 block">
            Por favor, introduce una URL válida (con http o https).
          </small>
        </div>

        <!-- Existing post images -->
        <div
          v-if="post.images && post.images.length && !editForm.images.length"
          class="mb-4 grid gap-1 relative border border-gray-200 rounded-lg overflow-hidden p-1 max-h-[400px] overflow-y-auto"
          :class="{
            'grid-cols-1': post.images.length === 1,
            'grid-cols-2': post.images.length >= 2
          }"
        >
          <div
            v-for="(img, i) in post.images"
            :key="'existing-' + i"
            class="relative group flex justify-center items-center w-full"
            :class="post.images.length > 1 ? 'aspect-square' : 'max-h-[380px]'"
          >
            <img
              :src="img"
              class="rounded max-w-full"
              :class="post.images.length > 1 ? 'w-full h-full object-cover' : 'max-h-[380px] object-contain bg-gray-50'"
            />
            <div
              class="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
            >
              <span class="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Imagen actual</span>
            </div>
          </div>
        </div>

        <!-- New images to upload -->
        <div
          v-if="editForm.images.length"
          class="mb-4 grid gap-1 relative border border-gray-200 rounded-lg overflow-hidden p-1 max-h-[400px] overflow-y-auto"
          :class="{
            'grid-cols-1': editForm.images.length === 1,
            'grid-cols-2': editForm.images.length >= 2
          }"
        >
          <div
            v-for="(img, i) in editForm.images"
            :key="'new-' + i"
            class="relative group flex justify-center items-center w-full"
            :class="editForm.images.length > 1 ? 'aspect-square' : 'max-h-[380px]'"
          >
            <img
              :src="img.preview"
              class="rounded max-w-full"
              :class="editForm.images.length > 1 ? 'w-full h-full object-cover' : 'max-h-[380px] object-contain bg-gray-50'"
            />
            <button
              class="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              @click="editRemoveImage(i)"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="px-4 pb-4 shrink-0">
        <div
          class="flex items-center justify-between px-4 py-3 mb-4 border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          <span class="text-gray-900 text-xs md:text-sm font-semibold">Agrega a tu publicación</span>
          <div class="flex gap-2">
            <button
              class="grid place-items-center w-9 h-9 border-0 rounded-full bg-transparent text-green-500 cursor-pointer transition-colors hover:bg-gray-100"
              title="Foto/Video"
              @click="editTriggerFileSelect"
            >
              <ImageIcon :size="24" />
            </button>
            <button
              class="grid place-items-center w-9 h-9 border-0 rounded-full bg-transparent text-blue-500 cursor-pointer transition-colors hover:bg-gray-100"
              title="Enlace"
              @click="editShowLinkInput = !editShowLinkInput"
            >
              <Link2 :size="24" />
            </button>
            <input
              type="file"
              ref="editFileInput"
              multiple
              accept="image/jpeg, image/png, image/jpg"
              class="hidden"
              @change="editHandleFileChange"
            />
          </div>
        </div>

        <SubmitButton
          :disabled="!editHasChanges || !editIsValid || editForm.processing || editLinkError"
          :loading="editForm.processing"
          loadingText="Guardando cambios"
          @click="saveEdit"
        >
          Guardar cambios
        </SubmitButton>
      </div>
    </SocialModal>

    <!-- Delete Confirmation Modal -->
    <PostTrashModal
      :isOpen="showDeleteConfirm"
      :isDeleting="isDeleting"
      @close="showDeleteConfirm = false"
      @confirmDelete="confirmDelete"
    />

    <!-- Lightbox imagen estilo LinkedIn -->
    <PostImageModal
      :post="{ ...post, _parsedBody: parsedBody }"
      :isOpen="showImageModal"
      @close="showImageModal = false"
    />

    <!-- Modal de reporte -->
    <PostReportModal
      :postId="post.id"
      :isOpen="showReportModal"
      @close="showReportModal = false"
      @reported="showReportModal = false"
    />

    <VerificationInfoModal
      :isOpen="isVerificationModalOpen"
      :type="verificationType"
      @close="isVerificationModalOpen = false"
    />
  </article>
</template>
