<script setup>
import { ref, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Users, Check, X } from '@lucide/vue';
import { feedService } from '@social/pages/feed/services/feed.service.js';

const open = ref(false);
const menuRef = ref(null);
const requests = ref([]);
const isLoading = ref(false);

onClickOutside(menuRef, () => {
  open.value = false;
});

const toggleDropdown = async () => {
  open.value = !open.value;
  if (open.value && requests.value.length === 0) {
    await fetchRequests();
  }
};

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const response = await feedService.getFriendRequests();
    if (response?.data?.data) {
      requests.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching friend requests', error);
  } finally {
    isLoading.value = false;
  }
};

const handleAccept = async (request) => {
  try {
    await feedService.acceptFriendRequest(request.id);
    // Optimistically remove from list
    requests.value = requests.value.filter((r) => r.id !== request.id);
  } catch (error) {
    console.error('Error accepting friend request', error);
  }
};

const handleReject = async (request) => {
  try {
    await feedService.rejectFriendRequest(request.id);
    // Optimistically remove from list
    requests.value = requests.value.filter((r) => r.id !== request.id);
  } catch (error) {
    console.error('Error rejecting friend request', error);
  }
};

onMounted(() => {
  fetchRequests();
});
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      class="p-2 rounded-full hover:bg-surface-alt transition-colors text-text-secondary hover:text-text-primary relative"
      :class="{
        'bg-slate-100 dark:bg-slate-800 text-[#009F55] dark:text-[#009F55]': open
      }"
      @click="toggleDropdown"
    >
      <Users class="w-[22px] h-[22px]" />
      <span
        v-if="requests.length > 0"
        class="absolute top-1 right-1 w-[15px] h-[15px] bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#11151c]"
      >
        {{ requests.length }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute top-[45px] right-0 z-50 w-[96vw] max-w-[320px] sm:w-80 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        class="border-b border-slate-100 px-4 py-3 dark:border-slate-800 flex justify-between items-center"
      >
        <h3 class="font-bold text-slate-900 dark:text-white">Solicitudes de amistad</h3>
      </div>

      <div
        class="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-text-muted p-2"
      >
        <div v-if="isLoading" class="p-4 text-center text-sm text-slate-400">Cargando...</div>
        <div v-else-if="requests.length === 0" class="p-4 text-center text-sm text-slate-400">
          No tienes solicitudes pendientes
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="req in requests"
            :key="req.id"
            class="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div class="flex items-center gap-3">
              <img
                :src="
                  req.sender?.profile?.avatar
                    ? 'http://be-gea-wrc.test/storage/' + req.sender.profile.avatar
                    : 'https://ui-avatars.com/api/?name=' + req.sender.name
                "
                class="soc-avatar-sm border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ req.sender.name }}
                </p>
                <p class="text-[10px] text-slate-500 line-clamp-1 max-w-[120px]">
                  {{ req.sender.profile?.headline || 'Usuario' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="handleAccept(req)"
                class="p-1.5 bg-[#009F55] text-white rounded-md hover:bg-[#008a4a] transition-colors"
                title="Aceptar"
              >
                <Check class="w-4 h-4" />
              </button>
              <button
                @click="handleReject(req)"
                class="p-1.5 bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Rechazar"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-icon-btn {
  @apply p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors;
}
.social-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.social-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.social-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.dark .social-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
