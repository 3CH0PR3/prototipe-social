<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { X, Send, Heart, MessageCircle, Share2, MoreHorizontal, Loader2 } from '@lucide/vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'add-comment', 'like-comment', 'like-post']);
const userStore = useUserStore();
const newComment = ref('');

function submitComment() {
  if (!newComment.value.trim()) return;
  emit('add-comment', { post_id: props.post.id, content: newComment.value });
  newComment.value = '';
}

// Format hashtags and mentions
function formatContent(text) {
  if (!text) return '';
  let formatted = text.replace(
    /#(\w+)/g,
    '<span class="text-brand font-medium hover:underline cursor-pointer">#$1</span>'
  );
  formatted = formatted.replace(
    /@(\w+)/g,
    '<span class="text-blue-400 cursor-pointer hover:underline">@$1</span>'
  );
  // Format URLs
  return formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="text-brand font-medium hover:underline cursor-pointer break-all">$1</a>'
  );
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <!-- Modal Layout inspired by Facebook (Post on left, comments on right on desktop) -->
      <div
        class="bg-[#1A1F24] rounded-lg shadow-2xl flex flex-col md:flex-row w-full max-w-5xl h-[85vh] mx-4 overflow-hidden border border-white/10"
      >
        <!-- Close button mobile -->
        <button
          @click="$emit('close')"
          class="md:hidden absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Left Column: Post Content -->
        <div
          class="w-full md:w-3/5 bg-black flex flex-col items-center justify-center relative border-r border-white/10"
        >
          <!-- If image exists -->
          <img v-if="post.image" :src="post.image" class="max-w-full max-h-full object-contain" />

          <!-- If text only -->
          <div
            v-else
            class="w-full h-full p-8 flex items-center justify-center bg-gradient-to-br from-[#0B110F] to-[#121916]"
          >
            <p class="text-2xl text-center text-white font-medium" v-html="formatContent(post.content)"></p>
          </div>
        </div>

        <!-- Right Column: Comments & Interactions -->
        <div class="w-full md:w-2/5 flex flex-col bg-[#121916] h-[50vh] md:h-full relative">
          <!-- Header (Desktop) -->
          <div class="hidden md:flex justify-between items-center p-4 border-b border-white/5">
            <h3 class="text-white font-bold"></h3>
            <button @click="$emit('close')" class="text-slate-400 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Post Author Info -->
          <div class="p-4 flex items-center gap-3 border-b border-white/5 shrink-0">
            <img
              :src="post.user?.avatar || 'https://ui-avatars.com/api/?name=' + (post.user?.name || 'User')"
              class="soc-avatar-sm"
            />
            <div>
              <h4 class="text-white font-medium text-sm">
                {{ post.user?.name || 'Usuario' }}
              </h4>
              <p class="text-slate-400 text-xs">
                {{ post.created_at_human || 'Recientemente' }}
              </p>
            </div>
          </div>

          <!-- Post Text (If it has image, show text here too) -->
          <div
            v-if="post.image && post.content"
            class="p-4 text-sm text-slate-200 border-b border-white/5 shrink-0"
            v-html="formatContent(post.content)"
          ></div>

          <!-- Comments List -->
          <div
            class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-text-muted p-4 space-y-4"
          >
            <div v-if="isLoading" class="flex justify-center py-8">
              <Loader2 class="w-6 h-6 text-emerald-500 animate-spin" />
            </div>

            <div v-else-if="comments.length === 0" class="text-center text-slate-400 py-8 text-sm">
              Sí el primero en comentar.
            </div>

            <div v-else v-for="comment in comments" :key="comment.id">
              <!-- Main Comment -->
              <div class="flex gap-2">
                <router-link
                  :to="{
                    name: 'social.profiles',
                    params: {
                      id: comment.author?.id || comment.author?.social_user_id
                    }
                  }"
                  class="shrink-0"
                  @click="$emit('close')"
                >
                  <img
                    :src="
                      comment.author?.avatar ||
                      'https://ui-avatars.com/api/?name=' +
                        (comment.author?.display_name || comment.author?.username || 'U')
                    "
                    class="w-8 h-8 rounded-full object-cover mt-1"
                  />
                </router-link>
                <div class="flex-1">
                  <div
                    class="bg-[#3A3B3C]/50 dark:bg-[#3A3B3C]/50 px-3 py-2 rounded-2xl inline-block max-w-full"
                  >
                    <div class="flex items-center gap-1.5">
                      <router-link
                        :to="{
                          name: 'social.profiles',
                          params: {
                            id: comment.author?.id || comment.author?.social_user_id
                          }
                        }"
                        class="text-[#E4E6EB] text-[13px] font-semibold hover:underline cursor-pointer"
                        @click="$emit('close')"
                      >
                        {{ comment.author?.display_name || comment.author?.username }}
                      </router-link>
                      <span
                        v-if="comment.author?.company"
                        class="text-[#B0B3B8] text-[11px] font-medium bg-[#3E4042] px-1.5 py-0.5 rounded"
                      >
                        {{ comment.author.company.name }}
                      </span>
                    </div>
                    <p
                      class="text-[#E4E6EB] text-[14px] leading-snug mt-0.5 whitespace-pre-wrap"
                      v-html="formatContent(comment.body)"
                    ></p>
                  </div>
                  <div class="flex items-center gap-4 mt-1 ml-2 text-[12px] font-bold text-[#B0B3B8]">
                    <span class="hover:underline cursor-pointer text-slate-400">Me gusta</span>
                    <span class="hover:underline cursor-pointer text-slate-400">Responder</span>
                    <span class="hover:underline cursor-pointer text-slate-400">Compartir</span>
                    <span class="font-normal text-slate-500 text-[11px]">
                      {{ comment.created_at_human || 'Ahora' }}
                    </span>
                    <span v-if="comment.likes_count > 0" class="flex items-center gap-1 cursor-pointer">
                      <span
                        class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px]"
                      >
                        👍
                      </span>
                      <span class="font-normal">{{ comment.likes_count }}</span>
                    </span>
                  </div>

                  <!-- Nested Replies -->
                  <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
                      <router-link
                        :to="{
                          name: 'social.profiles',
                          params: {
                            id: reply.author?.id || reply.author?.social_user_id
                          }
                        }"
                        class="shrink-0"
                        @click="$emit('close')"
                      >
                        <img
                          :src="
                            reply.author?.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                              (reply.author?.display_name || reply.author?.username || 'U')
                          "
                          class="w-7 h-7 rounded-full object-cover mt-1"
                        />
                      </router-link>
                      <div class="flex-1">
                        <div
                          class="bg-[#3A3B3C]/50 dark:bg-[#3A3B3C]/50 px-3 py-2 rounded-2xl inline-block max-w-full"
                        >
                          <div class="flex items-center gap-1.5">
                            <router-link
                              :to="{
                                name: 'social.profiles',
                                params: {
                                  id: reply.author?.id || reply.author?.social_user_id
                                }
                              }"
                              class="text-[#E4E6EB] text-[13px] font-semibold hover:underline cursor-pointer"
                              @click="$emit('close')"
                            >
                              {{ reply.author?.display_name || reply.author?.username }}
                            </router-link>
                            <span
                              v-if="reply.author?.company"
                              class="text-[#B0B3B8] text-[11px] font-medium bg-[#3E4042] px-1.5 py-0.5 rounded"
                            >
                              {{ reply.author.company.name }}
                            </span>
                          </div>
                          <p
                            class="text-[#E4E6EB] text-[14px] leading-snug mt-0.5 whitespace-pre-wrap"
                            v-html="formatContent(reply.body)"
                          ></p>
                        </div>
                        <div class="flex items-center gap-4 mt-1 ml-2 text-[12px] font-bold text-[#B0B3B8]">
                          <span class="hover:underline cursor-pointer text-slate-400">Me gusta</span>
                          <span class="hover:underline cursor-pointer text-slate-400">Responder</span>
                          <span class="hover:underline cursor-pointer text-slate-400">Compartir</span>
                          <span class="font-normal text-slate-500 text-[11px]">
                            {{ reply.created_at_human || 'Ahora' }}
                          </span>
                          <span v-if="reply.likes_count > 0" class="flex items-center gap-1 cursor-pointer">
                            <span
                              class="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px]"
                            >
                              👍
                            </span>
                            <span class="font-normal">{{ reply.likes_count }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interaction Bar -->
          <div class="p-3 border-t border-white/10 shrink-0">
            <div class="flex justify-between items-center text-slate-400 text-sm mb-3 px-2">
              <div class="flex items-center gap-1">
                <span class="text-blue-500">👍</span>
                <span>{{ post.likes_count || 0 }}</span>
              </div>
              <div class="flex gap-3">
                <span>{{ post.comments_count || comments.length }} comentarios</span>
              </div>
            </div>

            <div class="flex justify-between border-t border-b border-white/5 py-1 mb-3">
              <button
                @click="$emit('like-post')"
                class="flex-1 flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                :class="{ 'text-blue-500': post.is_liked }"
              >
                <Heart class="w-5 h-5" :class="{ 'fill-current': post.is_liked }" />
                <span class="font-medium">Me gusta</span>
              </button>
              <button
                class="flex-1 flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                <MessageCircle class="w-5 h-5" />
                <span class="font-medium">Comentar</span>
              </button>
              <button
                class="flex-1 flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                <Share2 class="w-5 h-5" />
                <span class="font-medium">Compartir</span>
              </button>
            </div>

            <!-- Comment Input -->
            <div class="flex items-end gap-2">
              <img
                :src="userStore.user?.avatar || 'https://ui-avatars.com/api/?name=' + userStore.user?.name"
                class="w-8 h-8 rounded-full mb-1 shrink-0"
              />
              <div
                class="flex-1 bg-white/5 rounded-2xl flex items-center overflow-hidden border border-white/10 focus-within:border-emerald-500/50 transition-colors"
              >
                <textarea
                  v-model="newComment"
                  @keydown.enter.exact.prevent="submitComment"
                  rows="1"
                  placeholder="Escribe un comentario..."
                  class="w-full bg-transparent border-none text-white text-sm px-4 py-2.5 focus:ring-0 resize-none max-h-24 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-text-muted"
                ></textarea>
                <button
                  @click="submitComment"
                  :disabled="!newComment.trim()"
                  class="p-2 mr-1 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
