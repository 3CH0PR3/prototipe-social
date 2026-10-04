<script setup>
import { ref, computed, watch } from 'vue';
import { Image as ImageIcon, Smile, Link2, X, Earth, Users, Lock, ChevronDown, AlertCircle } from '@lucide/vue';
import { useFeedStore } from '../stores/feed.store.js';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { useProfile } from '@shared/composables/useProfile';
import { useToast } from '@shared/composables/useToast';
import { useForm } from '@shared/composables/useForm';

import SocialModal from '@layouts/social/components/SocialModal.vue';
import TextInput from '@/shared/components/form/TextInput.vue';
import TextareaInput from '@/shared/components/form/TextareaInput.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';

const store = useFeedStore();
const userStore = useUserStore();
const toast = useToast();

const { user, fullName, avatar } = useProfile(userStore.user);

const props = defineProps({
  margin: { type: Boolean, default: true }
});

const emit = defineEmits(['postCreated']);

const isProfileLoaded = computed(() => !!userStore.user?.id);

const form = useForm({
  body: '',
  visibility: 'public',
  link: '',
  images: []
});

const showComposer = ref(false);
const fileInput = ref(null);
const composerTextarea = ref(null);
const showLinkInput = ref(false);
const linkError = ref(false);
const moderationError = ref(null); // Para mostrar errores de moderación

const audienceOptions = {
  public: { label: 'Público', icon: Earth },
  friends: { label: 'Amigos', icon: Users },
  only_me: { label: 'Solo yo', icon: Lock }
};

watch(
  () => form.link,
  (val) => {
    if (val) {
      try {
        new URL(val);
        linkError.value = false;
      } catch {
        linkError.value = true;
      }
    } else {
      linkError.value = false;
    }
  }
);

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const currentCount = form.images.length;
  if (currentCount + files.length > 10) {
    toast.error('Puedes subir un máximo de 10 imágenes.');
    return;
  }

  files.forEach((file) => {
    if (file.type === 'image/gif') {
      toast.error('No se admiten archivos GIF.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se admiten imágenes (JPG, PNG).');
      return;
    }
    form.images.push({
      file,
      preview: URL.createObjectURL(file)
    });
  });

  e.target.value = '';

  if (!showComposer.value) {
    showComposer.value = true;
  }
};

const removeImage = (index) => {
  URL.revokeObjectURL(form.images[index].preview);
  form.images.splice(index, 1);
};

const closeComposer = () => {
  showComposer.value = false;
  form.images.forEach((img) => URL.revokeObjectURL(img.preview));
  form.images.length = 0;
  form.reset();
  showLinkInput.value = false;
  moderationError.value = null; // Limpiar error de moderación
  if (composerTextarea.value && composerTextarea.value.$el) {
    composerTextarea.value.$el.style.height = 'auto';
  }
};

const autoResizeTextarea = (e) => {
  const target = e.target;
  target.style.height = 'auto';
  target.style.height = target.scrollHeight + 'px';

  // Auto-scroll the parent container to keep the cursor visible
  const container = target.closest('.overflow-y-auto');
  if (container) {
    // Only scroll if we are typing at or near the bottom
    // We add a small delay to allow the DOM to update the height before scrolling
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
};

const publish = async () => {
  if ((!form.body.trim() && !form.images.length && !form.link) || form.processing || linkError.value) return;

  moderationError.value = null; // Limpiar errores previos
  form.processing = true;
  try {
    const createdPost = await store.createPost(form.data());
    emit('postCreated', createdPost);
    closeComposer();
  } catch (error) {
    // Capturar errores de moderación (422)
    if (error?.response?.status === 422) {
      const errors = error.response?.data?.errors;
      if (errors?.images) {
        moderationError.value = Array.isArray(errors.images) ? errors.images[0] : errors.images;
        toast.error(moderationError.value);
      } else if (errors?.body) {
        moderationError.value = Array.isArray(errors.body) ? errors.body[0] : errors.body;
        toast.error(moderationError.value);
      } else {
        toast.error('El contenido no cumple con nuestras normas comunitarias.');
      }
    }
    // Otros errores ya manejados por store/toast
  } finally {
    form.processing = false;
  }
};
</script>

<template>
  <div :class="['soc-card', { 'md:my-4': margin }]">
    <div class="soc-card-body">
      <template v-if="!isProfileLoaded">
        <div class="soc-avatar-xs bg-gray-200 animate-pulse"></div>
        <div class="flex-1 min-w-0">
          <div class="w-full h-10 rounded-lg bg-gray-200 animate-pulse"></div>
        </div>
      </template>

      <template v-else>
        <router-link
          :to="{
            name: 'social.profiles.publications',
            params: { id: userStore.user?.id }
          }"
          class="border border-green-950/20 rounded-full"
        >
          <img
            :src="avatar || 'https://ui-avatars.com/api/?name=' + fullName"
            :alt="fullName"
            class="soc-avatar-xs"
          />
        </router-link>
        <div class="flex-1 min-w-0">
          <button
            class="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl px-4 py-2 text-[10px] md:text-sm font-medium transition-colors"
            @click="showComposer = true"
          >
            ¿Qué estás pensando, {{ fullName.split(' ')[0] }}?
          </button>
        </div>

        <div class="soc-composer-tools-actions">
          <button class="soc-btn-icon" title="Subir Foto/Video" @click="triggerFileSelect">
            <ImageIcon class="text-green-600" :size="18" />
          </button>
          <button class="soc-btn-icon" title="Sentimiento/Actividad">
            <Smile class="text-yellow-600" :size="18" />
          </button>
        </div>
      </template>
    </div>
  </div>

  <!-- Global hidden file input for both outside and inside triggers -->
  <input
    type="file"
    ref="fileInput"
    multiple
    accept="image/jpeg, image/png, image/jpg"
    class="hidden"
    @change="handleFileChange"
  />

  <SocialModal
    title="Crear publicación"
    :isOpen="showComposer"
    size="modal-sm"
    @close="closeComposer"
    :scrollable="true"
  >
    <!-- Post Author info -->
    <div class="flex items-center gap-3 shrink-0 px-4">
      <img
        :src="avatar || 'https://ui-avatars.com/api/?name=' + fullName"
        :alt="fullName"
        class="soc-avatar-xs"
      />
      <div class="flex flex-col">
        <b class="text-gray-900 text-[14px] font-bold">{{ fullName }}</b>

        <div class="relative mt-0.5 inline-block w-fit">
          <div
            class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[12px] font-semibold text-gray-700 pointer-events-none"
          >
            <component :is="audienceOptions[form.visibility].icon" :size="12" />
            {{ audienceOptions[form.visibility].label }}
            <ChevronDown :size="12" />
          </div>
          <select
            v-model="form.visibility"
            class="absolute !p-0 inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option class="text-gray-500" value="public">Público</option>
            <option class="text-gray-500" value="friends">Amigos</option>
            <option class="text-gray-500" value="only_me">Solo yo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="flex-1 flex flex-col min-h-0 px-4">
      <!-- Alerta de moderación -->
      <div
        v-if="moderationError"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
      >
        <AlertCircle :size="18" class="text-red-600 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-red-800 text-sm font-semibold">Contenido rechazado</p>
          <p class="text-red-700 text-xs mt-1">{{ moderationError }}</p>
        </div>
        <button @click="moderationError = null" class="text-red-400 hover:text-red-600">
          <X :size="16" />
        </button>
      </div>

      <TextareaInput
        ref="composerTextarea"
        v-model="form.body"
        :rows="2"
        @input="autoResizeTextarea"
        placeholder="¿Qué estás pensando?"
        class="min-h-fit px-1 border-0 outline-none focus:ring-0 focus:outline-none resize-none"
      />

      <div v-if="showLinkInput" class="mb-4">
        <TextInput v-model="form.link" type="url" placeholder="https://ejemplo.com" :error="linkError" />
        <small v-if="linkError" class="text-red-500 text-[11px] mt-1 block">
          Por favor, introduce una URL válida (con http o https).
        </small>
      </div>

      <!-- Image Grid Preview -->
      <div
        v-if="form.images.length"
        class="mb-4 grid gap-1 relative border border-gray-200 rounded-lg overflow-hidden p-1 max-h-[400px] overflow-y-auto"
        :class="{
          'grid-cols-1': form.images.length === 1,
          'grid-cols-2': form.images.length >= 2
        }"
      >
        <div
          v-for="(img, i) in form.images"
          :key="i"
          class="relative group flex justify-center items-center w-full"
          :class="form.images.length > 1 ? 'aspect-square' : 'max-h-[380px]'"
        >
          <img
            :src="img.preview"
            class="rounded max-w-full"
            :class="form.images.length > 1 ? 'w-full h-full object-cover' : 'max-h-[380px] object-contain bg-[#f7f9f6]'"
          />
          <button
            class="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            @click="removeImage(i)"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="px-4 pb-4 shrink-0">
      <div class="flex items-center justify-between p-3 mb-4 border border-gray-200 rounded-lg bg-white">
        <span class="text-gray-900 text-[14px] font-medium">Agrega a tu publicación</span>
        <div class="soc-composer-tools-actions">
          <button class="soc-btn-icon" title="Foto" @click="triggerFileSelect">
            <ImageIcon :size="20" class="text-green-500" />
          </button>
          <button class="soc-btn-icon" title="Enlace" @click="showLinkInput = !showLinkInput">
            <Link2 :size="20" class="text-blue-500" />
          </button>
        </div>
      </div>

      <SubmitButton
        :disabled="form.processing"
        :loading="form.processing"
        loadingText="Publicando"
        @click="publish"
      >
        Publicar
      </SubmitButton>
    </div>
  </SocialModal>
</template>

