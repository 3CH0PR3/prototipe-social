<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ThumbsUp, MoreHorizontal, Pencil, Trash2, ChevronDown } from '@lucide/vue';

import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { getProfileFullName, getProfileAvatar } from '@shared/composables/useProfile';
import { useFeedStore } from '../stores/feed.store.js';
import MentionInput from './MentionInput.vue';
import MentionText from './MentionText.vue';

const props = defineProps({
  comment: { type: Object, required: true },
  post: { type: Object, required: true },
  isLast: { type: Boolean, default: false }
});

const emit = defineEmits(['reply', 'like-comment', 'delete-comment', 'edit-comment']);

const router = useRouter();
const userStore = useUserStore();
const feedStore = useFeedStore();

const replyingToId = ref(null);
const editingId = ref(null);
const loadingReplies = ref(false);
const repliesPage = ref(0);

// Menú flotante — un solo menú para todo el componente
const menuTarget = ref(null); // { item, canEdit }
const menuStyle = ref({}); // { top, left } en px fijos

const openMenu = (item, event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    zIndex: 9999
  };
  menuTarget.value = item;
};
const closeMenu = () => {
  menuTarget.value = null;
};

// Cerrar si se hace clic fuera del menú
const onDocClick = (e) => {
  if (!e.target.closest('[data-float-menu]')) closeMenu();
};
onMounted(() => document.addEventListener('mousedown', onDocClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocClick));

// Long press móvil
let longPressTimer = null;
const startLongPress = (item, event) => {
  longPressTimer = setTimeout(() => openMenu(item, event), 500);
};
const cancelLongPress = () => clearTimeout(longPressTimer);

const remainingReplies = computed(() =>
  Math.max(0, props.comment.replies_count - (props.comment.replies?.length || 0))
);

const canManage = (item) =>
  userStore.user?.id === item.author?.id || userStore.user?.id === props.post.social_user_id;

const canEdit = (item) => userStore.user?.id === item.author?.id;

const goToProfile = (id) => {
  if (!id) return;
  router.push({ name: 'social.profiles', params: { id } });
};

const loadReplies = async (c) => {
  if (loadingReplies.value) return;
  loadingReplies.value = true;
  try {
    repliesPage.value++;
    await feedStore.fetchReplies(props.post.id, c.id, repliesPage.value);
  } catch {
    repliesPage.value--;
  } finally {
    loadingReplies.value = false;
  }
};

const submitReply = (commentData, parent) => {
  emit('reply', {
    postId: props.post.id,
    text: commentData?.text ?? commentData ?? '',
    mentions: commentData?.mentions ?? [],
    parentId: parent.id
  });
  replyingToId.value = null;
};

const startEdit = (item) => {
  editingId.value = item.id;
  closeMenu();
};

const saveEdit = (commentData, item) => {
  emit('edit-comment', {
    postId: props.post.id,
    commentId: item.id,
    text: commentData?.text ?? commentData ?? ''
  });
  editingId.value = null;
};

const deleteItem = (item) => {
  emit('delete-comment', item);
  closeMenu();
};
</script>

<template>
  <!-- Menú flotante — fuera de cualquier overflow, pegado al body -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="menuTarget"
        data-float-menu
        :style="menuStyle"
        class="w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1"
      >
        <button
          v-if="canEdit(menuTarget)"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-0 bg-transparent cursor-pointer"
          @click="startEdit(menuTarget)"
        >
          <Pencil :size="14" />
          Editar
        </button>
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer"
          @click="deleteItem(menuTarget)"
        >
          <Trash2 :size="14" />
          Eliminar
        </button>
      </div>
    </Transition>
  </Teleport>

  <!-- Comentario principal -->
  <div class="flex gap-2.5 w-full group/comment" :class="{ 'mb-4': !isLast }">
    <button
      class="shrink-0 w-8 h-8 rounded-full overflow-hidden mt-0.5 border-0 bg-transparent p-0 cursor-pointer"
      type="button"
      @click="goToProfile(comment.author?.id)"
    >
      <img
        :src="
          getProfileAvatar(comment.author) ||
          `https://ui-avatars.com/api/?name=${getProfileFullName(comment.author)}`
        "
        :alt="getProfileFullName(comment.author)"
        class="w-full h-full object-cover"
      />
    </button>

    <div
      class="flex-1 min-w-0"
      :class="{
        'opacity-60': comment._optimistic,
        'opacity-40': comment._error
      }"
    >
      <!-- Nombre · tiempo · ··· -->
      <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
        <button
          class="font-medium text-xs text-gray-900 hover:underline leading-none border-0 bg-transparent p-0 cursor-pointer"
          type="button"
          @click="goToProfile(comment.author?.id)"
        >
          {{ getProfileFullName(comment.author) }}
        </button>

        <span v-if="comment._optimistic" class="text-[8px] md:text-xs text-blue-500">· Enviando...</span>
        <span v-else-if="comment._error" class="text-[8px] md:text-xs text-red-500">· Error</span>
        <span v-else-if="comment.time" class="text-[8px] md:text-xs text-gray-400">· {{ comment.time }}</span>
        <span v-if="comment.is_edited && !comment._optimistic" class="text-[8px] md:text-xs text-gray-400">
          (Editado)
        </span>

        <!-- Botón ··· -->
        <button
          v-if="editingId !== comment.id && canManage(comment) && !comment._optimistic && !comment._processing"
          type="button"
          class="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-0 bg-transparent cursor-pointer transition-all opacity-0 group-hover/comment:opacity-100"
          @click.stop="openMenu(comment, $event)"
          @touchstart.passive="startLongPress(comment, $event)"
          @touchend.passive="cancelLongPress"
          @touchmove.passive="cancelLongPress"
        >
          <MoreHorizontal :size="13" />
        </button>
      </div>

      <!--  -->
      <template v-if="editingId === comment.id">
        <div class="mt-1 flex flex-col items-end w-full">
          <MentionInput
            :initial-value="comment.text || comment.body || ''"
            :autofocus="true"
            class="w-full"
            @submit="saveEdit($event, comment)"
          />
          <button
            class="text-xs text-gray-500 hover:underline bg-transparent border-0 cursor-pointer mt-1"
            type="button"
            @click="editingId = null"
          >
            Cancelar
          </button>
        </div>
      </template>

      <!-- Texto -->
      <p v-else class="soc-text-body">
        <MentionText :text="comment.text || comment.body" :mentions="comment.mentions || []" />
      </p>

      <!-- Acciones -->
      <div class="flex items-center mt-1.5 text-xs gap-3">
        <button
          type="button"
          :class="[
            'flex text-gray-500 items-center gap-1 border-0 bg-transparent p-0 cursor-pointer transition-colors',
            comment.viewer_has_liked ? 'text-blue-600' : 'hover:text-blue-600'
          ]"
          @click="$emit('like-comment', comment)"
        >
          <ThumbsUp :size="12" :fill="comment.viewer_has_liked ? 'currentColor' : 'none'" />
        </button>

        <button
          type="button"
          class="border-0 bg-transparent text-gray-800 font-medium p-0 cursor-pointer hover:text-blue-600 transition-colors"
          @click="replyingToId = replyingToId === comment.id ? null : comment.id"
        >
          Responder
        </button>

        <div
          v-if="comment.likes_count > 0"
          class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm"
        >
          <ThumbsUp :size="8" color="white" fill="white" />
        </div>
      </div>

      <!-- Replies -->
      <div v-if="comment.replies?.length" class="mt-3 flex flex-col gap-3 pl-4 border-l-2 border-gray-100">
        <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2 w-full group/reply">
          <button
            class="shrink-0 w-6 h-6 rounded-full overflow-hidden mt-0.5 border-0 bg-transparent p-0 cursor-pointer"
            type="button"
            @click="goToProfile(reply.author?.id)"
          >
            <img
              :src="
                getProfileAvatar(reply.author) ||
                `https://ui-avatars.com/api/?name=${getProfileFullName(reply.author)}`
              "
              :alt="getProfileFullName(reply.author)"
              class="w-full h-full object-cover"
            />
          </button>

          <div class="flex-1 min-w-0">
            <!-- Nombre · tiempo · ··· reply -->
            <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
              <button
                class="font-medium text-xs text-gray-900 hover:underline leading-none border-0 bg-transparent p-0 cursor-pointer"
                type="button"
                @click="goToProfile(reply.author?.id)"
              >
                {{ getProfileFullName(reply.author) }}
              </button>
              <span v-if="reply.time" class="text-[8px] text-gray-400">· {{ reply.time }}</span>
              <span v-if="reply.is_edited" class="text-[8px] text-gray-400">(Editado)</span>

              <!-- Botón ··· reply -->
              <button
                v-if="editingId !== reply.id && canManage(reply) && !reply._optimistic && !reply._processing"
                type="button"
                class="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-0 bg-transparent cursor-pointer transition-all opacity-0 group-hover/reply:opacity-100"
                @click.stop="openMenu(reply, $event)"
                @touchstart.passive="startLongPress(reply, $event)"
                @touchend.passive="cancelLongPress"
                @touchmove.passive="cancelLongPress"
              >
                <MoreHorizontal :size="13" />
              </button>
            </div>

            <!--  reply -->
            <template v-if="editingId === reply.id">
              <div class="mt-1 flex flex-col items-end w-full">
                <MentionInput
                  :initial-value="reply.text || reply.body || ''"
                  :autofocus="true"
                  class="w-full"
                  @submit="saveEdit($event, reply)"
                />
                <button
                  class="text-xs text-gray-500 hover:underline bg-transparent border-0 cursor-pointer mt-1"
                  type="button"
                  @click="editingId = null"
                >
                  Cancelar
                </button>
              </div>
            </template>

            <!-- Texto reply -->
            <p v-else class="text-sm leading-tight">
              <MentionText :text="reply.text || reply.body" :mentions="reply.mentions || []" />
            </p>

            <!-- Acciones reply -->
            <div class="flex items-center mt-1 text-xs font-bold text-gray-500 gap-4">
              <button
                type="button"
                :class="[
                  'flex items-center border-0 bg-transparent p-0 cursor-pointer transition-colors',
                  reply.viewer_has_liked ? 'text-blue-600' : 'hover:text-blue-600'
                ]"
                @click="$emit('like-comment', reply)"
              >
                <ThumbsUp :size="12" :fill="reply.viewer_has_liked ? 'currentColor' : 'none'" />
              </button>
              <button
                type="button"
                class="border-0 bg-transparent p-0 cursor-pointer hover:text-blue-600 transition-colors"
                @click="replyingToId = replyingToId === reply.id ? null : reply.id"
              >
                Responder
              </button>
            </div>

            <MentionInput
              v-if="replyingToId === reply.id"
              :user="userStore.user"
              :initial-value="`@${getProfileFullName(reply.author)} `"
              :initial-mentions="[
                {
                  id: reply.author?.id,
                  name: getProfileFullName(reply.author)
                }
              ]"
              :placeholder="`Responder a ${getProfileFullName(reply.author)}`"
              :autofocus="true"
              @submit="submitReply($event, comment)"
            />
          </div>
        </div>
      </div>

      <!-- Cargar más -->
      <div v-if="remainingReplies > 0" class="mt-2 pl-4 border-l-2 border-gray-100">
        <button
          type="button"
          class="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 border-0 bg-transparent cursor-pointer"
          @click="loadReplies(comment)"
        >
          <svg
            v-if="loadingReplies"
            class="animate-spin w-4 h-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <ChevronDown v-else :size="16" class="text-gray-500" />
          Ver {{ remainingReplies }} respuesta{{ remainingReplies > 1 ? 's' : '' }}
        </button>
      </div>

      <!-- Input responder -->
      <MentionInput
        v-if="replyingToId === comment.id"
        class="mt-2"
        :user="userStore.user"
        :initial-value="`@${getProfileFullName(comment.author)} `"
        :initial-mentions="[{ id: comment.author?.id, name: getProfileFullName(comment.author) }]"
        :placeholder="`Responder a ${getProfileFullName(comment.author)}...`"
        :autofocus="true"
        @submit="submitReply($event, comment)"
      />
    </div>
  </div>
</template>
