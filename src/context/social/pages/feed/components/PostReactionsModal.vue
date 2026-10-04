<script setup>
import { computed } from 'vue';
import { ThumbsUp, UserPlus } from '@lucide/vue';
import SocialModal from '@layouts/social/components/SocialModal.vue';
import { useFriendshipStore } from '@social/shared/stores/useFriendship.store';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  loadingReactions: { type: Boolean, default: false },
  reactionsList: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'goToProfile']);

const friendshipStore = useFriendshipStore();

const close = () => {
  emit('close');
};
</script>

<template>
  <SocialModal
    title="Todas"
    :isOpen="isOpen"
    maxWidth="max-w-md"
    @close="close"
  >
    <div class="px-5 py-2.5 max-h-[60vh] overflow-y-auto hide-scrollbar">
      <template v-if="loadingReactions">
        <div v-for="i in 5" :key="i" class="flex items-center justify-between mb-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-200"></div>
            <div class="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
          <div class="w-36 h-9 bg-gray-200 rounded-lg"></div>
        </div>
      </template>

      <template v-else-if="reactionsList.length">
        <div v-for="reaction in reactionsList" :key="reaction.id" class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3 cursor-pointer" @click="$emit('goToProfile', reaction.user.id)">
            <div class="relative">
              <img
                :src="
                  reaction.user.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(reaction.user.name)}`
                "
                class="soc-avatar-xs"
                @error="
                  $event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reaction.user.name)}`
                "
              />
              <div
                class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border border-white"
              >
                <ThumbsUp :size="8" color="white" fill="white" />
              </div>
            </div>
            <span class="text-gray-900 text-[13px] font-medium hover:underline">
              {{ reaction.is_self ? 'Tú' : reaction.user.name }}
            </span>
          </div>

          <span v-if="reaction.is_self" class="text-gray-400 text-xs px-3"></span>

          <template v-else>
            <button
              v-if="reaction.is_friend || friendshipStore.getStatus(reaction.user.id).isFriend"
              class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-sm font-bold rounded-md transition-colors border-0 cursor-pointer"
              @click="$emit('goToProfile', reaction.user.id)"
            >
              Ver perfil
            </button>

            <button
              v-else-if="friendshipStore.getStatus(reaction.user.id).hasSentPendingRequest"
              class="btn-secondary !rounded-lg !text-xs !bg-gray-200 !text-gray-700 cursor-pointer"
              :disabled="friendshipStore.getStatus(reaction.user.id).isLoading"
              @click="friendshipStore.cancelRequest(reaction.user.id)"
            >
              {{ friendshipStore.getStatus(reaction.user.id).isLoading ? 'Cargando...' : 'Cancelar solicitud' }}
            </button>

            <button
              v-else
              class="btn-primary !rounded-lg !text-xs cursor-pointer"
              :disabled="friendshipStore.getStatus(reaction.user.id).isLoading"
              @click="friendshipStore.sendRequest(reaction.user.id)"
            >
              <UserPlus :size="14" v-if="!friendshipStore.getStatus(reaction.user.id).isLoading" />
              {{ friendshipStore.getStatus(reaction.user.id).isLoading ? 'Enviando...' : 'Agregar' }}
            </button>
          </template>
        </div>
      </template>

      <template v-else>
        <div class="text-center p-4 text-gray-500">Nadie ha reaccionado aún.</div>
      </template>
    </div>
  </SocialModal>
</template>
