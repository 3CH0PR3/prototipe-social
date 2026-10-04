<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Users, Globe2, Lock, Image as ImageIcon } from '@lucide/vue';
import { useGroupsStore } from '../stores/useGroups.store.js';
import { useUserStore } from '../../user/stores/useUser.store.js';

const router = useRouter();
const groupsStore = useGroupsStore();
const userStore = useUserStore();

const draft = ref({
  name: '',
  description: '',
  privacy: 'public',
  cover_url: '',
  category: 'General'
});

const isSubmitting = ref(false);

const createGroup = async () => {
  if (!draft.value.name.trim()) return;

  isSubmitting.value = true;
  try {
    const newGroup = await groupsStore.createItem(draft.value);
    if (newGroup && newGroup.id) {
      router.push(`/social/groups/${newGroup.id}`);
    } else {
      router.push('/social/groups');
    }
  } catch (error) {
    console.error('Error creating group:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-surface-alt flex flex-col md:flex-row">
    <!-- Left Sidebar (Form) -->
    <aside
      class="w-full md:w-80 lg:w-96 bg-surface border-r border-border flex flex-col h-screen md:sticky top-0 z-20 shadow-sm shrink-0"
    >
      <div class="p-4 border-b border-border flex items-center gap-3">
        <button
          @click="router.push('/social/groups')"
          class="w-9 h-9 rounded-full bg-surface-alt hover:bg-border flex items-center justify-center transition-colors text-text-secondary"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-2xl font-bold text-text-primary leading-tight">Crear grupo</h1>
      </div>

      <div class="p-4 flex flex-col gap-6 overflow-y-auto flex-1 hide-scrollbar">
        <!-- User Info (Creator) -->
        <div class="flex items-center gap-3">
          <img
            v-if="userStore.user?.avatar"
            :src="userStore.user.avatar"
            class="w-10 h-10 rounded-full bg-surface-alt object-cover"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"
          >
            <Users :size="20" />
          </div>
          <div>
            <p class="text-sm font-semibold text-text-primary">
              {{ userStore.user?.name || 'Administrador' }}
            </p>
            <p class="text-xs text-text-secondary">Tú serás el creador del grupo</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-semibold text-text-secondary mb-1">Nombre del grupo *</label>
            <input
              v-model="draft.name"
              type="text"
              placeholder="Asigna un nombre al grupo"
              class="w-full border border-border bg-surface-alt rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 text-text-primary outline-none transition-colors"
            />
          </div>

          <!-- Privacy Select -->
          <div>
            <label class="block text-sm font-semibold text-text-secondary mb-1">Elegir privacidad *</label>
            <div class="relative">
              <select
                v-model="draft.privacy"
                class="w-full border border-border bg-surface-alt rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 text-text-primary outline-none transition-colors appearance-none"
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            <p class="text-xs text-text-secondary mt-1.5 flex gap-1.5 leading-tight">
              <component
                :is="draft.privacy === 'public' ? Globe2 : Lock"
                :size="14"
                class="shrink-0 mt-0.5"
              />
              <span v-if="draft.privacy === 'public'">
                Cualquier persona puede ver quién pertenece al grupo y lo que se publica.
              </span>
              <span v-else>Solo los miembros pueden ver quién pertenece al grupo y lo que se publica.</span>
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-text-secondary mb-1"></label>
            <textarea
              v-model="draft.description"
              rows="3"
              placeholder="¿De qué trata este grupo?"
              class="w-full border border-border bg-surface-alt rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 text-text-primary outline-none transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Cover Image URL -->
          <div>
            <label class="block text-sm font-semibold text-text-secondary mb-1">
              Imagen de portada (URL opcional)
            </label>
            <input
              v-model="draft.cover_url"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              class="w-full border border-border bg-surface-alt rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600 text-text-primary outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 border-t border-border bg-surface">
        <button
          @click="createGroup"
          :disabled="!draft.name || isSubmitting"
          class="w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
          :class="
            draft.name
              ? 'bg-[green-600] hover:bg-[green-700] text-white shadow-sm'
              : 'bg-surface-alt text-text-secondary cursor-not-allowed'
          "
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Crear
        </button>
      </div>
    </aside>

    <!-- Right Area (Preview) -->
    <main class="flex-1 bg-surface-alt p-4 md:p-8 flex items-center justify-center overflow-y-auto">
      <div class="w-full max-w-4xl">
        <div
          class="bg-surface rounded-xl p-3 md:p-4 mb-4 shadow-sm border border-border font-semibold text-text-secondary flex items-center gap-2 text-sm"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
          Vista previa para computadoras
        </div>

        <!-- Live Preview Card -->
        <div class="bg-surface rounded-xl shadow-md border border-border overflow-hidden">
          <!-- Cover Preview -->
          <div
            class="h-64 md:h-80 w-full relative bg-surface-alt flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="draft.cover_url"
              :src="draft.cover_url"
              class="w-full h-full object-cover"
              @error="draft.cover_url = ''"
            />
            <div v-else class="text-text-secondary flex flex-col items-center gap-2 opacity-50">
              <ImageIcon :size="48" />
              <span class="font-medium">Imagen de portada del grupo</span>
            </div>

            <div
              class="absolute bottom-4 right-4 bg-surface px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 border border-border opacity-70 cursor-not-allowed"
            >
              <ImageIcon :size="16" />
              Editar portada
            </div>
          </div>

          <!-- Header Preview -->
          <div class="px-6 md:px-8 py-6 pb-0">
            <h2 class="text-3xl font-extrabold text-text-primary mb-1 break-words">
              {{ draft.name || 'Nombre del grupo' }}
            </h2>
            <div class="flex items-center gap-1.5 text-text-secondary font-medium text-base mb-4">
              <component :is="draft.privacy === 'public' ? Globe2 : Lock" :size="16" />
              <span>{{ draft.privacy === 'public' ? 'Grupo público' : 'Grupo privado' }}</span>
              <span>·</span>
              <span class="font-bold text-text-primary">1 miembro</span>
            </div>
          </div>

          <div class="px-6 md:px-8">
            <div class="border-t border-border py-1">
              <nav class="flex gap-1" aria-label="Tabs Preview">
                <div class="px-4 py-3 text-base font-semibold text-green-600 border-b-[3px] border-green-600">
                  
                </div>
                <div class="px-4 py-3 text-base font-semibold text-text-secondary">Publicaciones</div>
                <div class="px-4 py-3 text-base font-semibold text-text-secondary">Miembros</div>
              </nav>
            </div>
          </div>

          <!-- Body Preview -->
          <div class="bg-surface-alt p-6 md:p-8 flex gap-4 min-h-72">
            <div class="flex-1 space-y-4">
              <div class="bg-surface p-4 rounded-xl shadow-sm border border-border flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface-alt shrink-0"></div>
                <div class="bg-surface-alt rounded-full px-4 py-2.5 text-text-secondary flex-1 text-base">
                  ¿Qué estás pensando?
                </div>
              </div>
            </div>
            <div class="w-72 hidden lg:block space-y-4">
              <div class="bg-surface p-4 rounded-xl shadow-sm border border-border">
                <h3 class="font-bold text-text-primary mb-2"></h3>
                <p class="text-sm text-text-secondary break-words">
                  {{ draft.description || 'Aqué se mostrará la  del grupo.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
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
