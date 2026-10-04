<script setup>
import { useRouter, useRoute } from 'vue-router';
import { Home, Users, Compass, User, Bookmark, TrendingUp, Building2 } from '@lucide/vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store';
import { useProfile } from '@shared/composables/useProfile';
import { Shop2 } from 'reicon-vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { avatar, firstName, lastName, fullName } = useProfile(userStore.user);

const mainNav = [
  { label: 'Inicio', icon: Home, route: 'social.feed' },
  { label: 'Grupos', icon: Users, route: 'social.groups' },
  { label: 'Explorar', icon: Compass, route: 'social.explore' },
  { label: 'Empresas', icon: Building2, route: 'social.companies' },
  { label: 'Tienda', icon: Shop2, route: 'social.shop' }
];

const activityNav = [
  { label: 'Guardados', icon: Bookmark, route: 'social.explore' },
  { label: 'Tendencias', icon: TrendingUp, route: 'social.trends' }
];

const isActive = (name) => route.name === name;
const go = (name) => router.push({ name });
</script>

<template>
  <aside class="soc-sidebar-left">
    <nav class="soc-sidebar-nav">
      <div v-if="userStore.user?.id" class="soc-subtitle mb-4">
        <router-link
          :to="{
            name: 'social.profiles.publications',
            params: { id: userStore.user.id }
          }"
          class="soc-subtitle"
        >
          <div class="soc-sidebar-profile">
            <img
              :src="avatar || 'https://ui-avatars.com/api/?name=' + (fullName || 'U')"
              :alt="fullName"
              class="soc-avatar-xs"
            />
            <span class="soc-sidebar-profile-name">
              {{ fullName }}
            </span>
          </div>
        </router-link>
      </div>
      <button
        v-for="item in mainNav"
        :key="item.route"
        class="soc-nav-link"
        :class="{ active: isActive(item.route) }"
        @click="go(item.route)"
      >
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </button>
    </nav>
  </aside>
</template>
