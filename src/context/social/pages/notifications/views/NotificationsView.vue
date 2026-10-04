<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  ArrowLeft,
  MoreHorizontal,
  Settings,
  Bell
} from '@lucide/vue';
// Assuming alias @ is configured
import { useNotificationsStore } from '../stores/useNotifications.store.js';

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
const handleItem = (n) => store.markRead(n.id);
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div class="pt-4 pb-2 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <button
              class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
              @click="router.back()"
            >
              <ArrowLeft :size="20" class="mr-1" />
              Volver
            </button>
            <div class="flex items-center gap-2">
              <button
                class="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                @click="store.markAllRead()"
                title="Marcar todo como leído"
              >
                <Settings :size="20" />
              </button>
              <button
                class="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <MoreHorizontal :size="20" />
              </button>
            </div>
          </div>

          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Notificaciones</h1>
          </div>

          <div class="flex items-center gap-6 mt-2 border-b border-gray-100">
            <button
              :class="[
                'pb-3 px-1 text-sm font-bold transition-colors border-b-2 focus:outline-none',
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
                'pb-3 px-1 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 focus:outline-none',
                tab === 'unread'
                  ? 'border-[#009F55] text-[#009F55]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              ]"
              @click="tab = 'unread'"
            >
              No leídas
              <span
                v-if="store.unreadCount"
                class="bg-[#009F55] text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {{ store.unreadCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-grow max-w-3xl mx-auto w-full px-0 sm:px-6 py-4 sm:py-8">
      <div class="bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 overflow-hidden">
        <template v-if="visibleNew.length">
          <div class="px-4 sm:px-6 py-3 bg-gray-50/50 border-b border-gray-50">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nuevas</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <button
              v-for="n in visibleNew"
              :key="n.id"
              :class="[
                'w-full text-left px-4 sm:px-6 py-4 flex items-start gap-4 transition-colors hover:bg-gray-50 focus:outline-none group',
                { 'bg-[#009F55]/[0.02]': !n.read }
              ]"
              @click="handleItem(n)"
            >
              <div class="relative flex-shrink-0 mt-1">
                <img
                  v-if="n.actor.avatar"
                  :src="n.actor.avatar"
                  :alt="n.actor.name"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg ring-2 ring-white shadow-sm"
                >
                  {{ n.actor.initials }}
                </span>
                <span
                  class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"
                  :style="{ background: iconColor[n.icon] }"
                >
                  <component :is="iconMap[n.icon]" :size="12" />
                </span>
              </div>
              <div class="flex-grow min-w-0 pr-2">
                <p class="text-sm sm:text-base text-gray-800 leading-snug">
                  <strong class="font-bold text-gray-900">{{ n.actor.name }}</strong>
                  {{ n.text }}
                  <strong v-if="n.bold" class="font-bold text-gray-900">{{ n.bold }}</strong>
                </p>
                <p :class="['text-xs font-medium mt-1.5', !n.read ? 'text-[#009F55]' : 'text-gray-400']">
                  {{ n.time }}
                </p>
              </div>
              <div v-if="!n.read" class="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#009F55] mt-2"></div>
            </button>
          </div>
        </template>

        <template v-if="visibleEarlier.length">
          <div class="px-4 sm:px-6 py-3 bg-gray-50/50 border-y border-gray-50">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Anteriores</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <button
              v-for="n in visibleEarlier"
              :key="n.id"
              :class="[
                'w-full text-left px-4 sm:px-6 py-4 flex items-start gap-4 transition-colors hover:bg-gray-50 focus:outline-none group',
                { 'bg-[#009F55]/[0.02]': !n.read }
              ]"
              @click="handleItem(n)"
            >
              <div class="relative flex-shrink-0 mt-1">
                <img
                  v-if="n.actor.avatar"
                  :src="n.actor.avatar"
                  :alt="n.actor.name"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg ring-2 ring-white shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  {{ n.actor.initials }}
                </span>
                <span
                  class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"
                  :style="{ background: iconColor[n.icon] }"
                >
                  <component :is="iconMap[n.icon]" :size="12" />
                </span>
              </div>
              <div class="flex-grow min-w-0 pr-2">
                <p class="text-sm sm:text-base text-gray-600 leading-snug">
                  <strong class="font-bold text-gray-800">{{ n.actor.name }}</strong>
                  {{ n.text }}
                  <strong v-if="n.bold" class="font-bold text-gray-800">{{ n.bold }}</strong>
                </p>
                <p :class="['text-xs font-medium mt-1.5', !n.read ? 'text-[#009F55]' : 'text-gray-400']">
                  {{ n.time }}
                </p>
              </div>
              <div v-if="!n.read" class="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#009F55] mt-2"></div>
            </button>
          </div>
        </template>

        <div
          v-if="!visibleNew.length && !visibleEarlier.length"
          class="px-6 py-16 flex flex-col items-center justify-center text-center"
        >
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <Bell :size="32" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">Todo al día</h3>
          <p class="text-gray-500 text-sm max-w-xs">
            No tienes notificaciones
            {{ tab === 'unread' ? 'no leídas' : '' }} en este momento.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
