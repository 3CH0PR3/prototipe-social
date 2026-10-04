<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Heart, MessageCircle, UserPlus, Users, MoreHorizontal, Bell } from '@lucide/vue';
// Assuming alias @ is configured
import { useNotificationsStore } from '../stores/useNotifications.store.js';

const emit = defineEmits(['close']);
const router = useRouter();
const store = useNotificationsStore();
const tab = ref('all');

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  group: Users
};
const iconColor = {
  like: '#e53935',
  comment: '#1b8a4a',
  follow: '#1976d2',
  group: '#7b3fa0'
};

const visibleNew = computed(() =>
  tab.value === 'unread' ? (store.newItems || []).filter((n) => !n.read) : store.newItems || []
);
const visibleEarlier = computed(() =>
  tab.value === 'unread' ? (store.earlierItems || []).filter((n) => !n.read) : store.earlierItems || []
);

const goAll = () => {
  store.markAllRead();
  router.push({ name: 'social.notifications' });
  emit('close');
};

const handleItem = (n) => {
  store.markRead(n.id);
  emit('close');
};
</script>

<template>
  <div class="soc-notifications-dropdown" role="dialog" aria-label="Notificaciones">
    <div class="px-4 py-3 flex items-center justify-between border-b border-gray-100">
      <h2 class="text-base font-bold text-gray-900">Notificaciones</h2>
      <button
        class="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
        aria-label="Opciones"
      >
        <MoreHorizontal :size="18" />
      </button>
    </div>

    <div class="flex items-center gap-4 px-4 border-b border-gray-100">
      <button
        :class="[
          'py-2.5 px-1 text-[12px] font-bold transition-colors border-b-2 focus:outline-none',
          tab === 'all'
            ? 'border-[#009F55] text-[#009F55]'
            : 'border-transparent text-gray-500 hover:text-gray-800'
        ]"
        @click="tab = 'all'"
      >
        Todas
      </button>
      <button
        :class="[
          'py-2.5 px-1 text-[12px] font-bold transition-colors border-b-2 flex items-center gap-2 focus:outline-none',
          tab === 'unread'
            ? 'border-[#009F55] text-[#009F55]'
            : 'border-transparent text-gray-500 hover:text-gray-800'
        ]"
        @click="tab = 'unread'"
      >
        No leídas
      </button>
    </div>

    <div class="overflow-y-auto flex-grow overscroll-contain">
      <template v-if="visibleNew.length">
        <div
          class="px-4 py-2 bg-gray-50/80 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm"
        >
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nuevas</span>
          <button
            class="text-[11px] font-bold text-[#009F55] hover:text-[#008A4A] transition-colors focus:outline-none"
            @click="goAll"
          >
            Ver todo
          </button>
        </div>
        <div class="divide-y divide-gray-50">
          <button
            v-for="n in visibleNew"
            :key="n.id"
            :class="[
              'w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-gray-50 focus:outline-none group',
              { 'bg-[#009F55]/[0.03]': !n.read }
            ]"
            @click="handleItem(n)"
          >
            <div class="relative flex-shrink-0 mt-0.5">
              <img
                v-if="n.actor.avatar"
                :src="n.actor.avatar"
                :alt="n.actor.name"
                class="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover"
              />
              <span
                v-else
                class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm"
              >
                {{ n.actor.initials }}
              </span>
              <span
                class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"
                :style="{ background: iconColor[n.icon] || '#009F55' }"
              >
                <component :is="iconMap[n.icon]" :size="8" />
              </span>
            </div>
            <div class="flex-grow min-w-0 pr-2">
              <p class="text-[12px] text-gray-800 leading-snug line-clamp-2">
                <strong class="font-bold text-gray-900">{{ n.actor.name }}</strong>
                {{ n.text }}
                <strong v-if="n.bold" class="font-bold text-gray-900">{{ n.bold }}</strong>
              </p>
              <p :class="['text-[10px] font-medium mt-0.5', !n.read ? 'text-[#009F55]' : 'text-gray-400']">
                {{ n.time }}
              </p>
            </div>
            <div
              v-if="!n.read"
              class="flex-shrink-0 w-2 h-2 rounded-full bg-[#009F55] mt-1"
              aria-label="No leída"
            ></div>
          </button>
        </div>
      </template>

      <template v-if="visibleEarlier.length">
        <div class="px-4 py-2 bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Anteriores</span>
        </div>
        <div class="divide-y divide-gray-50">
          <button
            v-for="n in visibleEarlier"
            :key="n.id"
            :class="[
              'w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-gray-50 focus:outline-none group',
              { 'bg-[#009F55]/[0.03]': !n.read }
            ]"
            @click="handleItem(n)"
          >
            <div class="relative flex-shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <img
                v-if="n.actor.avatar"
                :src="n.actor.avatar"
                :alt="n.actor.name"
                class="w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover"
              />
              <span
                v-else
                class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm"
              >
                {{ n.actor.initials }}
              </span>
              <span
                class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"
                :style="{ background: iconColor[n.icon] || '#009F55' }"
              >
                <component :is="iconMap[n.icon]" :size="8" />
              </span>
            </div>
            <div class="flex-grow min-w-0 pr-2">
              <p class="text-[12px] text-gray-600 leading-snug line-clamp-2">
                <strong class="font-bold text-gray-800">{{ n.actor.name }}</strong>
                {{ n.text }}
                <strong v-if="n.bold" class="font-bold text-gray-800">{{ n.bold }}</strong>
              </p>
              <p :class="['text-[10px] font-medium mt-0.5', !n.read ? 'text-[#009F55]' : 'text-gray-400']">
                {{ n.time }}
              </p>
            </div>
            <div
              v-if="!n.read"
              class="flex-shrink-0 w-2 h-2 rounded-full bg-[#009F55] mt-1"
              aria-label="No leída"
            ></div>
          </button>
        </div>
      </template>

      <div
        v-if="!visibleNew.length && !visibleEarlier.length"
        class="px-4 py-12 flex flex-col items-center justify-center text-center"
      >
        <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
          <Bell :size="24" />
        </div>
        <p class="text-gray-500 text-[12px] font-medium">
          No tienes notificaciones {{ tab === 'unread' ? 'no leídas' : '' }}.
        </p>
      </div>
    </div>

    <div class="p-2 bg-gray-50/50 border-t border-gray-100">
      <button
        class="w-full py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm focus:outline-none"
        @click="goAll"
      >
        Ver todas las notificaciones
      </button>
    </div>
  </div>
</template>
