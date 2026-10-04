<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  MoreHorizontal,
  Users,
  Lock,
  Globe2,
  Bell,
  Share2,
  Image as ImageIcon,
  Send,
  ShieldAlert,
  Settings,
  AlertTriangle,
  UserPlus,
  FileText,
  CheckSquare,
  Search,
  MessageSquare,
  Menu
} from '@lucide/vue';
import { useGroupsStore } from '../stores/useGroups.store.js';
import GroupPost from '../components/GroupPost.vue';
import { useUserStore } from '../../user/stores/useUser.store.js';

const route = useRoute();
const router = useRouter();
const groups = useGroupsStore();
const userStore = useUserStore();

const tab = ref('');
const composer = ref('');
const showMobileMenu = ref(false);

const group = computed(
  () => groups.items.find((item) => item.id === route.params.id) || groups.items[0] || {}
);
const posts = computed(() => group.value.posts || []);
const isAdmin = computed(() => group.value.owner_id === userStore.user?.id);

const publish = () => {
  if (!composer.value.trim()) return;
  // Logic to publish to group feed would go here via groups.createPost(group.id, composer.value)
  composer.value = '';
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};
</script>

<template>
  <div class="min-h-screen bg-surface-alt flex flex-col">
    <!-- Top Header (Mobile & Sticky) -->
    <header
      class="sticky top-0 z-40 bg-surface/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border shadow-sm lg:hidden"
    >
      <div class="flex items-center gap-3">
        <button
          class="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary"
          @click="router.push('/social/groups')"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="font-bold text-text-primary truncate max-w-xs">
          {{ group.name }}
        </h1>
      </div>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-alt text-text-secondary"
        @click="toggleMobileMenu"
      >
        <Menu :size="20" />
      </button>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar (Navigation & Admin) -->
      <aside
        class="w-72 bg-surface border-r border-border flex-col h-[calc(100vh-60px)] lg:h-screen sticky top-16 lg:top-0 shrink-0 overflow-y-auto hide-scrollbar hidden lg:flex"
        :class="{ '!flex fixed inset-y-0 left-0 z-50': showMobileMenu }"
      >
        <div class="p-4 border-b border-border flex items-center gap-3 lg:hidden">
          <button
            @click="showMobileMenu = false"
            class="w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center"
          >
            <ArrowLeft :size="20" />
          </button>
          <span class="font-bold text-text-primary">Volver al grupo</span>
        </div>

        <div class="p-3 border-b border-border hidden lg:block">
          <button
            class="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt px-3 py-2 rounded-lg w-full transition-colors"
            @click="router.push('/social/groups')"
          >
            <ArrowLeft :size="16" />
            Volver a Grupos
          </button>
        </div>

        <div class="p-3">
          <div class="flex items-center gap-3 p-2 mb-2">
            <div
              class="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center overflow-hidden border border-border"
            >
              <img v-if="group.cover_url" :src="group.cover_url" class="w-full h-full object-cover" />
              <ImageIcon v-else :size="20" class="text-text-secondary" />
            </div>
            <div>
              <h2 class="font-bold text-text-primary leading-tight line-clamp-1">
                {{ group.name }}
              </h2>
              <p class="text-xs text-text-secondary flex items-center gap-1">
                <component :is="group.visibility === 'private' ? Lock : Globe2" :size="12" />
                {{ group.visibility === 'private' ? 'Grupo privado' : 'Grupo público' }}
              </p>
            </div>
          </div>

          <nav class="space-y-1">
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-alt text-text-primary font-semibold text-base"
            >
              <div
                class="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-green-600"
              >
                <MessageSquare :size="18" />
              </div>
              Inicio de la comunidad
            </a>
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-base transition-colors"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center">
                <FileText :size="20" />
              </div>
              Resumen
            </a>
          </nav>
        </div>

        <div v-if="isAdmin" class="p-3 border-t border-border mt-2">
          <h3 class="px-3 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Herramientas para administradores
          </h3>
          <nav class="space-y-1">
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-sm transition-colors"
            >
              <UserPlus :size="18" />
              Solicitudes de miembros
            </a>
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-sm transition-colors"
            >
              <CheckSquare :size="18" />
              Publicaciones pendientes
            </a>
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-sm transition-colors"
            >
              <AlertTriangle :size="18" />
              Posible spam
            </a>
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-sm transition-colors"
            >
              <ShieldAlert :size="18" />
              Reglas del grupo
            </a>
            <a
              href="#"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt text-text-secondary font-medium text-sm transition-colors"
            >
              <Settings :size="18" />
               del grupo
            </a>
          </nav>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto bg-surface-alt">
        <div class="max-w-5xl mx-auto bg-surface shadow-sm mb-4">
          <!-- Cover -->
          <div class="h-48 md:h-80 w-full relative bg-gray-200">
            <img
              v-if="group.cover_url || group.cover"
              :src="group.cover_url || group.cover"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400"
            >
              <ImageIcon :size="48" />
            </div>

            <!-- Edit cover button for admins -->
            <button
              v-if="isAdmin"
              class="absolute bottom-4 right-4 bg-white text-gray-900 px-3 py-1.5 rounded-md text-sm font-semibold shadow flex items-center gap-2 hover:bg-gray-50"
            >
              <ImageIcon :size="16" />
              Editar portada
            </button>
          </div>

          <!-- Header Info -->
          <div class="px-4 md:px-8 pt-6 pb-0">
            <h1 class="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">
              {{ group.name }}
            </h1>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-1.5 text-text-secondary font-medium text-base">
                <component :is="group.visibility === 'private' ? Lock : Globe2" :size="16" />
                <span>{{ group.visibility === 'private' ? 'Grupo privado' : 'Grupo público' }}</span>
                <span>·</span>
                <span class="font-bold text-text-primary">{{ group.members || 1 }} miembros</span>
              </div>

              <div class="flex items-center gap-2 w-full md:w-auto">
                <button
                  class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface border border-border text-text-primary px-4 py-2 rounded-lg font-semibold text-sm hover:bg-surface-alt transition-colors shadow-sm"
                  type="button"
                >
                  <Share2 :size="16" />
                  <span class="hidden md:inline">Compartir</span>
                </button>
                <button
                  class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
                  :class="
                    group.joined
                      ? 'bg-surface-alt border border-border text-text-primary hover:bg-border'
                      : 'bg-green-600 text-white hover:bg-[green-700]'
                  "
                  type="button"
                  @click="groups.toggleMembership(group)"
                >
                  {{ group.joined ? 'Eres miembro' : 'Unirme' }}
                </button>
                <button
                  class="w-10 h-10 flex items-center justify-center text-text-primary bg-surface border border-border hover:bg-surface-alt rounded-lg transition-colors"
                  type="button"
                >
                  <MoreHorizontal :size="18" />
                </button>
              </div>
            </div>

            <div class="border-t border-border py-1">
              <nav class="flex gap-1 overflow-x-auto hide-scrollbar" aria-label="Tabs Grupo">
                <button
                  v-for="item in ['', '', 'Miembros', 'Eventos', 'Multimedia']"
                  :key="item"
                  :class="[
                    'whitespace-nowrap px-4 py-3 text-base font-semibold border-b-[3px] transition-colors',
                    tab === item
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-text-secondary hover:bg-surface-alt rounded-t-lg'
                  ]"
                  type="button"
                  @click="tab = item"
                >
                  {{ item }}
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 pb-12 flex gap-4 items-start">
          <!-- Feed Area -->
          <div v-if="tab === ''" class="flex-1 min-w-0 space-y-4">
            <form
              class="bg-surface p-4 rounded-xl shadow-sm border border-border flex gap-3 md:gap-4"
              @submit.prevent="publish"
            >
              <img
                v-if="userStore.user?.avatar"
                :src="userStore.user.avatar"
                class="w-10 h-10 rounded-full object-cover bg-surface-alt shrink-0"
              />
              <div v-else class="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>

              <div class="flex-1 min-w-0">
                <textarea
                  v-model="composer"
                  rows="1"
                  class="w-full bg-surface-alt border border-transparent rounded-full px-5 py-2.5 text-base text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white dark:focus:bg-gray-800 transition-colors resize-none mb-3"
                  placeholder="Escribe algo..."
                ></textarea>
                <div class="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    class="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <ImageIcon :size="18" class="text-green-500" />
                    Foto/video
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:bg-surface-alt px-3 py-2 rounded-lg transition-colors flex-1 justify-center"
                  >
                    <Users :size="18" class="text-blue-500" />
                    Etiquetar
                  </button>
                  <button
                    type="submit"
                    class="bg-green-600 text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-[green-700] transition-colors shadow-sm disabled:opacity-50"
                    :disabled="!composer.trim()"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </form>

            <div class="space-y-4">
              <GroupPost v-for="post in posts" :key="post.id" :post="post" />
              <div
                v-if="!posts.length"
                class="bg-surface p-8 rounded-xl border border-border shadow-sm text-center"
              >
                <p class="text-text-secondary font-medium">Aún no hay publicaciones en este grupo.</p>
              </div>
            </div>
          </div>

          <div v-else class="flex-1 bg-surface p-8 rounded-xl border border-border shadow-sm text-center">
            <h2 class="text-xl font-bold text-text-primary mb-2">{{ tab }}</h2>
            <p class="text-text-secondary text-sm">Próximamente disponible.</p>
          </div>

          <!-- Right Sidebar (Info & Setup) -->
          <div class="w-80 hidden xl:block space-y-4 shrink-0">
            <div v-if="isAdmin" class="bg-surface p-4 rounded-xl shadow-sm border border-border">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-text-primary">Termina de configurar tu grupo</h3>
                <span class="text-sm text-text-secondary">0 de 4</span>
              </div>
              <div class="w-full bg-surface-alt rounded-full h-1.5 mb-4">
                <div class="bg-green-600 h-1.5 rounded-full" style="width: 25%"></div>
              </div>
              <ul class="space-y-3">
                <li class="flex items-center gap-3 text-sm text-text-secondary line-through">
                  <div class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <CheckSquare :size="12" />
                  </div>
                  Agrega una 
                </li>
                <li class="flex items-center gap-3 text-sm text-text-primary font-medium">
                  <div class="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center">
                    <UserPlus :size="14" />
                  </div>
                  Invita a personas a unirse
                </li>
                <li class="flex items-center gap-3 text-sm text-text-primary font-medium">
                  <div class="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center">
                    <ImageIcon :size="14" />
                  </div>
                  Agrega una foto de portada
                </li>
                <li class="flex items-center gap-3 text-sm text-text-primary font-medium">
                  <div class="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center">
                    <MessageSquare :size="14" />
                  </div>
                  Crea una 
                </li>
              </ul>
            </div>

            <div class="bg-surface p-4 rounded-xl shadow-sm border border-border">
              <h3 class="font-bold text-text-primary mb-3"></h3>
              <p class="text-sm text-text-secondary mb-4 break-words">
                {{ group.description || 'Sin ' }}
              </p>

              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <Globe2
                    v-if="group.visibility === 'public'"
                    :size="20"
                    class="text-text-primary shrink-0"
                  />
                  <Lock v-else :size="20" class="text-text-primary shrink-0" />
                  <div>
                    <strong class="block text-sm text-text-primary">
                      {{ group.visibility === 'public' ? 'Público' : 'Privado' }}
                    </strong>
                    <span class="text-xs text-text-secondary">
                      {{
                        group.visibility === 'public'
                          ? 'Cualquier persona puede ver quién pertenece al grupo y lo que se publica.'
                          : 'Solo los miembros pueden ver quién pertenece al grupo y lo que se publica.'
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <Search :size="20" class="text-text-primary shrink-0" />
                  <div>
                    <strong class="block text-sm text-text-primary">Visible</strong>
                    <span class="text-xs text-text-secondary">
                      Cualquier persona puede encontrar este grupo.
                    </span>
                  </div>
                </div>
              </div>

              <button
                class="w-full mt-4 py-2 bg-surface-alt hover:bg-border text-text-primary rounded-lg text-sm font-semibold transition-colors"
              >
                Más 
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
