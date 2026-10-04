<script setup>
import { MoreHorizontal, Heart, MessageCircle, Share2 } from '@lucide/vue';
import { useProfile } from '@shared/composables/useProfile';
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});
const { fullName, avatar, initials } = useProfile(() => props.post.author || props.post);
</script>

<template>
  <article class="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
    <header class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <img v-if="avatar" :src="avatar" :alt="fullName" class="soc-avatar-sm bg-gray-100" />
        <div
          v-else
          class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm"
        >
          {{ initials }}
        </div>
        <div>
          <strong class="block text-sm font-bold text-gray-900">{{ fullName }}</strong>
          <span class="block text-xs text-gray-500">{{ post.role }} · {{ post.time }}</span>
        </div>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        type="button"
      >
        <MoreHorizontal :size="17" />
      </button>
    </header>

    <p class="text-gray-800 text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">
      {{ post.text }}
    </p>

    <footer class="flex items-center gap-2 md:gap-4 pt-3 border-t border-gray-50">
      <button
        type="button"
        class="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-full transition-colors"
      >
        <Heart :size="15" />
        <span class="hidden md:inline">Me gusta</span>
        <span class="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full ml-1">
          {{ post.likes }}
        </span>
      </button>
      <button
        type="button"
        class="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-full transition-colors"
      >
        <MessageCircle :size="15" />
        <span class="hidden md:inline">Comentar</span>
        <span class="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full ml-1">
          {{ post.comments }}
        </span>
      </button>
      <button
        type="button"
        class="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-full transition-colors md:ml-auto"
      >
        <Share2 :size="15" />
        <span class="hidden md:inline">Compartir</span>
      </button>
    </footer>
  </article>
</template>
