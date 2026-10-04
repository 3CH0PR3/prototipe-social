<script setup>
import { ref, computed } from 'vue';
import { MoreHorizontal, Pencil, Trash2, BellOff, UserPlus, Earth, Users, Lock } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  post: { type: Object, required: true },
  author: { type: Object, default: () => ({}) },
  isOwner: { type: Boolean, default: false }
});

const emit = defineEmits(['edit', 'delete', 'navigate-profile']);

const router = useRouter();
const showContextMenu = ref(false);
const contextMenuRef = ref(null);

const audienceIcons = {
  public: Earth,
  friends: Users,
  only_me: Lock
};

const visibilityIcon = computed(() => {
  const vis = props.post.visibility || props.post.audience || 'public';
  return audienceIcons[vis] || Earth;
});

onClickOutside(contextMenuRef, () => {
  showContextMenu.value = false;
});

const handleEdit = () => {
  showContextMenu.value = false;
  emit('edit');
};

const handleDelete = () => {
  showContextMenu.value = false;
  emit('delete');
};

const goToProfile = () => {
  if (props.post.is_ad) return;
  const userId = props.post.social_user_id || props.author.id;
  if (!userId) return;
  emit('navigate-profile', userId);
};
</script>

<template>
  <header class="flex items-start justify-between p-4">
    <!-- Avatar + Info -->
    <div class="flex items-start gap-3 flex-1 min-w-0">
      <button @click="goToProfile" class="shrink-0 group" :class="{ 'cursor-default pointer-events-none': post.is_ad }">
        <img
          :src="author.avatar"
          :alt="author.fullName"
          class="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-emerald-500 transition-all"
        />
      </button>

      <div class="flex-1 min-w-0">
        <button
          @click="goToProfile"
          :class="[
            'font-medium text-gray-900 dark:text-white text-left transition-colors',
            post.is_ad
              ? 'cursor-default'
              : 'hover:text-emerald-600 dark:hover:text-emerald-400'
          ]"
        >
          {{ author.fullName }}
        </button>

        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          <time>{{ post.created_at_human || post.time || 'ahora' }}</time>
          <span>·</span>
          <component :is="visibilityIcon" :size="12" />
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div class="relative" ref="contextMenuRef">
      <button
        @click="showContextMenu = !showContextMenu"
        class="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Más opciones"
      >
        <MoreHorizontal :size="20" />
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showContextMenu"
          class="absolute right-0 mt-1 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10 overflow-hidden"
        >
          <div class="py-1">
            <template v-if="isOwner">
              <button
                @click="handleEdit"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Pencil :size="16" />
                <span>Editar </span>
              </button>
              <button
                @click="handleDelete"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                <Trash2 :size="16" />
                <span>Eliminar </span>
              </button>
            </template>
            <template v-else>
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <BellOff :size="16" />
                <span>Ocultar </span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <UserPlus :size="16" />
                <span>Seguir a {{ author.firstName }}</span>
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>
