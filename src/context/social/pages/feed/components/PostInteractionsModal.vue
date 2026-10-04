<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { X, UserPlus, UserCheck, Loader2 } from '@lucide/vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    required: true
  },
  interactions: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'add-friend']);

function getBadgeColor(type) {
  return type === 'like'
    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    : 'text-red-500 bg-red-50 dark:bg-red-900/20';
}

function handleAddFriend(user) {
  emit('add-friend', user.id);
  user.is_pending_friend = true;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-surface rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-4">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-alt/50">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            Me gusta
            <span class="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {{ post.likes_count || interactions.length }}
            </span>
          </h3>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div
          class="p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-text-muted p-0 max-h-[60vh] overflow-y-auto"
        >
          <div v-if="isLoading" class="divide-y divide-white/5">
            <div v-for="i in 3" :key="i" class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-3 w-full">
                <div class="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-slate-700/50 rounded animate-pulse w-1/3"></div>
                  <div class="h-2 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="interactions.length === 0" class="text-center py-12 text-slate-400">
            Aún no hay interacciones
          </div>

          <ul v-else class="divide-y divide-white/5">
            <li
              v-for="user in interactions"
              :key="user.id"
              class="p-4 hover:bg-white/5 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <router-link
                  :to="{
                    name: 'social.profiles',
                    params: { id: user.id || user.social_user_id }
                  }"
                  class="relative block"
                  @click="$emit('close')"
                >
                  <img
                    :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name"
                    class="soc-avatar-sm border border-white/10"
                  />
                  <!-- Reaction Badge -->
                  <div
                    class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-[#1A1F24]"
                    :class="getBadgeColor(user.reaction_type || 'like')"
                  >
                    <span v-if="(user.reaction_type || 'like') === 'like'" class="text-[10px]">👍</span>
                    <span v-else class="text-[10px]">❤️</span>
                  </div>
                </router-link>

                <div>
                  <h4 class="font-medium text-slate-200 text-sm flex items-center gap-1.5">
                    <router-link
                      :to="{
                        name: 'social.profiles',
                        params: { id: user.id || user.social_user_id }
                      }"
                      class="hover:underline cursor-pointer"
                      @click="$emit('close')"
                    >
                      {{ user.name }}
                    </router-link>
                    <span
                      v-if="user.company_badge"
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider"
                      title="Empresa verificada"
                    >
                      Empresa
                    </span>
                  </h4>
                  <p v-if="user.headline" class="text-xs text-slate-400 truncate max-w-[200px]">
                    {{ user.headline }}
                  </p>
                </div>
              </div>

              <!-- Add Friend Button -->
              <button
                v-if="!user.is_friend && !user.is_pending_friend && !user.is_self"
                @click="handleAddFriend(user)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
              >
                <UserPlus class="w-4 h-4" />
                <span class="hidden sm:inline">Agregar</span>
              </button>

              <button
                v-else-if="user.is_pending_friend && !user.is_self"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-200 dark:bg-slate-800 text-slate-900 dark:text-slate-400 cursor-default"
                disabled
              >
                <UserCheck class="w-4 h-4" />
                <span class="hidden sm:inline">Pendiente</span>
              </button>

              <button
                v-else-if="user.is_friend && !user.is_self"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 cursor-default"
                disabled
              >
                <UserCheck class="w-4 h-4" />
                <span class="hidden sm:inline">Amigos</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
