<script setup>
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useActiveRoute } from '@shared/composables/useActiveRoute';
import { User, Settings, HelpCircle, AlertCircle, Moon, LogOut, ChevronRight } from '@lucide/vue';
import { useAuthStore } from '@social/auth/stores/useAuth.store';
import { useProfile } from '@shared/composables/useProfile';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
  user: { type: [Array, Object], default: () => ({}) }
});

const { isActive } = useActiveRoute();

const { avatar, initials, fullName, hasAvatar } = useProfile(() => props.user);

const open = ref(false);
const menuRef = ref(null);

onClickOutside(menuRef, () => {
  open.value = false;
});

const logout = async () => {
  // Primero hacer redirect
  router.replace({ name: 'social.login' });
  // Luego limpiar (esto evita el error de re-render)
  await authStore.handleLogout();
};
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      v-if="user"
      type="button"
      class="flex gap-1.5 p-0 items-center transition-all duration-200 rounded-full border text-text-secondary"
      :class="[open ? 'border-border-strong bg-surface-alt' : 'border-transparent hover:bg-surface']"
      @click="open = !open"
    >
      <template v-if="hasAvatar">
        <img
          :src="avatar"
          :alt="fullName"
          class="w-10 h-10 border border-gray-200 rounded-full object-cover"
        />
      </template>
      <template v-else>
        <div
          class="flex w-10 h-10 items-center border border-brand-500/50 justify-center rounded-full bg-gray-100 text-gray-700 font-bold"
        >
          {{ initials }}
        </div>
      </template>
    </button>

    <div v-if="open" class="soc-profile-dropdown">
      <router-link
        v-if="user?.id"
        :to="{ name: 'social.profiles.publications', params: { id: user.id } }"
        class="flex items-center gap-2.5 p-2 mb-1.5 rounded-md border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
        @click="open = false"
      >
        <template v-if="hasAvatar">
          <div class="border border-green-950/20 rounded-full">
            <img :src="avatar" :alt="fullName" class="soc-avatar-sm shrink-0" />
          </div>
        </template>
        <template v-else>
          <div
            class="flex items-center w-8 h-8 shrink-0 justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-xs"
          >
            {{ initials }}
          </div>
        </template>

        <span class="flex-1 text-[14px] font-semibold text-gray-900 truncate min-w-0">
          {{ fullName }}
        </span>
      </router-link>

      <div class="border-t border-gray-200 w-full my-1.5"></div>

      <!-- Menu Items -->
      <div class="space-y-0.5">
        <button
          class="w-full flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors group border-0 bg-transparent cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            >
              <Settings class="w-3.5 h-3.5" />
            </div>
            <span class="text-[12px] font-semibold text-gray-900">Configuración y privacidad</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>

        <button
          class="w-full flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors group border-0 bg-transparent cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            >
              <HelpCircle class="w-3.5 h-3.5" />
            </div>
            <span class="text-[12px] font-semibold text-gray-900">Ayuda y soporte técnico</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>

        <button
          class="w-full flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors group border-0 bg-transparent cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            >
              <AlertCircle class="w-3.5 h-3.5" />
            </div>
            <div class="flex flex-col items-start">
              <span class="text-[12px] font-semibold text-gray-900">Reportar un problema</span>
            </div>
          </div>
        </button>

        <button
          class="w-full flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors group border-0 bg-transparent cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            >
              <Moon class="w-3.5 h-3.5" />
            </div>
            <span class="text-[12px] font-semibold text-gray-900">Pantalla y accesibilidad</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        </button>

        <button
          class="w-full flex items-center justify-between p-1.5 hover:bg-gray-100 rounded-lg transition-colors group border-0 bg-transparent cursor-pointer"
          @click="logout"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0"
            >
              <LogOut class="w-3.5 h-3.5" />
            </div>
            <span class="text-[12px] font-semibold text-gray-900">Cerrar sesión</span>
          </div>
        </button>
      </div>

      <!-- Footer Links -->
      <div class="mt-2 px-2 text-[10px] text-gray-500 leading-tight">
        <a href="#" class="hover:underline">Privacidad</a>
        ·
        <a href="#" class="hover:underline">Condiciones</a>
        ·
        <a href="#" class="hover:underline">Publicidad</a>
        ·
        <a href="#" class="hover:underline">Opciones de anuncios</a>
        ·
        <a href="#" class="hover:underline">Cookies</a>
        ·
        <a href="#" class="hover:underline">Más</a>
      </div>
    </div>
  </div>
</template>
