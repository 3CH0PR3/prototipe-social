<script setup>
import { ref, onMounted } from 'vue';
import { ShieldCheck, Flag, Activity, Users, Settings } from '@lucide/vue';
import { feedService } from '@social/pages/feed/services/feed.service.js';
import PostCard from '@social/pages/feed/components/PostCard.vue';
import { useFeedStore } from '@social/pages/feed/stores/feed.store.js';

const activeTab = ref('posts');
const feedStore = useFeedStore();
const loading = ref(true);
const systemPosts = ref([]);

// Mock stats for the "Motor" feeling
const stats = {
  users: '125K+',
  companies: '3.2K',
  postsToday: '14.5K',
  uptime: '99.9%'
};

onMounted(async () => {
  loading.value = true;
  try {
    // Fetch some initial posts for the system feed
    await feedStore.fetchPosts(true);
    // Filter posts from GEA-WRC user for this view
    systemPosts.value = feedStore.posts.filter(p => p.author?.is_gea_wrc);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-6">
    <!-- Header Corporativo GEA-WRC -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="h-48 bg-gradient-to-r from-emerald-800 to-emerald-600 relative">
        <div class="absolute inset-0 bg-black/10"></div>
      </div>
      <div class="px-8 pb-8 relative">
        <div class="flex justify-between items-end -mt-16 mb-4">
          <div class="bg-white p-1 rounded-2xl shadow-md border-4 border-white">
            <div class="w-32 h-32 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ShieldCheck :size="64" />
            </div>
          </div>
          <div class="flex gap-3 mb-2">
            <button class="soc-btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Settings :size="16" />
              <span>Ajustes del Sistema</span>
            </button>
          </div>
        </div>
        
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
            GEA-WRC
            <ShieldCheck class="text-emerald-500 fill-emerald-500/10" :size="24" title="Motor Oficial" />
          </h1>
          <p class="text-gray-500 text-lg mt-1">Motor Oficial y  Central de la Red Social</p>
        </div>

        <!-- System Stats -->
        <div class="grid grid-cols-4 gap-4 mt-8 py-6 border-t border-gray-100">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.users }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Usuarios</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.companies }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Empresas</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stats.postsToday }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Posts Hoy</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ stats.uptime }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Uptime</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <nav class="flex border-b border-gray-100">
        <button
          class="px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2"
          :class="activeTab === 'posts' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'posts'"
        >
          <Activity :size="18" />
          Feed Oficial
        </button>
        <button
          class="px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2"
          :class="activeTab === 'reports' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = 'reports'"
        >
          <Flag :size="18" />
           (Reportes)
        </button>
      </nav>

      <div class="p-6 bg-gray-50/50 min-h-[400px]">
        <!-- Tab: Posts -->
        <div v-if="activeTab === 'posts'" class="max-w-2xl mx-auto space-y-4">
          <div v-if="loading" class="text-center text-gray-500 py-10">Cargando sistema...</div>
          <template v-else>
            <PostCard
              v-for="post in systemPosts"
              :key="post.id"
              :post="post"
            />
            <div v-if="systemPosts.length === 0" class="text-center text-gray-500 py-10">
              No hay comunicados oficiales recientes.
            </div>
          </template>
        </div>

        <!-- Tab: Reports -->
        <div v-else-if="activeTab === 'reports'" class="space-y-6">
          <div class="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
              <Flag :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Centro de </h3>
            <p class="text-gray-500 max-w-md mx-auto mb-6">
              Aqué aparecerán las publicaciones reportadas por spam, odio, o contenido inapropiado para su revisión y .
            </p>
            <button class="soc-btn-primary bg-gray-900 text-white hover:bg-gray-800">
              Cargar Reportes Pendientes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
