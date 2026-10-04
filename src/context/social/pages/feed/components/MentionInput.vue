<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Send, Camera, Smile } from '@lucide/vue';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';
import { ProfilesService } from '@social/pages/profiles/services/profiles.service';
import { useProfile } from '@shared/composables/useProfile';
import TextInput from '@/shared/components/form/TextInput.vue';
import SecondaryButton from '@/shared/components/button/SecondaryButton.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';

const props = defineProps({
  placeholder: { type: String, default: 'Escribe un comentario...' },
  initialValue: { type: String, default: '' },
  initialMentions: { type: Array, default: () => [] },
  autofocus: { type: Boolean, default: false }
});

const emit = defineEmits(['submit']);

const userStore = useUserStore();
const { avatar: userAvatar, fullName: userFullName } = useProfile(computed(() => userStore.user));

const text = ref(props.initialValue);
const input = ref(null);
const selectedMentions = ref([...props.initialMentions]);

// ── Estado LOCAL de sugerencias — no compartido con ninguna otra instancia ──
const suggestions = ref([]);
const isSearching = ref(false);
let searchTimer = null;

// Query activa: texto después del último @
const mentionQuery = computed(() => {
  const match = text.value.match(/@([^@\s]*)$/);
  return match ? match[1] : '';
});

watch(mentionQuery, (query) => {
  clearTimeout(searchTimer);
  if (!query) {
    suggestions.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res = await ProfilesService.search(query);
      suggestions.value = res.data?.items || res.data?.data?.items || res.data?.users || [];
    } catch {
      suggestions.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

// Cuando cambia initialValue desde fuera (reply pre-fill)
watch(
  () => props.initialValue,
  (val) => {
    if (val !== text.value) text.value = val;
  }
);

const clearSuggestions = () => {
  suggestions.value = [];
  isSearching.value = false;
};

const chooseMention = (user) => {
  const match = text.value.match(/@([^@\s]*)$/);
  const before = match ? text.value.slice(0, match.index) : text.value;
  text.value = `${before}@${user.name} `;
  selectedMentions.value.push({ id: user.id, name: user.name });
  clearSuggestions();
  input.value?.focus();
};

// Shift+Enter → salto de línea  |  Enter solo → enviar
const onKeydown = (e) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Insertar \n en la  del cursor
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      text.value = text.value.slice(0, start) + '\n' + text.value.slice(end);
      // Mover el cursor después del salto
      setTimeout(() => el.setSelectionRange(start + 1, start + 1), 0);
    } else {
      e.preventDefault();
      submit();
    }
  }
};

const submit = () => {
  if (!text.value.trim()) return;

  const allMentions = selectedMentions.value.filter((m) => text.value.includes(`@${m.name}`));

  emit('submit', { text: text.value.trim(), mentions: allMentions });

  text.value = '';
  selectedMentions.value = [];
  clearSuggestions();
};

onMounted(() => {
  if (props.autofocus) setTimeout(() => input.value?.focus(), 50);
});

onUnmounted(() => clearTimeout(searchTimer));
</script>

<template>
  <form class="flex items-center gap-2 w-full relative" @submit.prevent="submit">
    <!-- Avatar -->
    <img
      :src="userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}`"
      :alt="userFullName"
      class="soc-avatar-xs shrink-0 cursor-pointer hover:opacity-80 transition-opacity mt-1"
    />

    <!-- Input container -->
    <div
      class="flex-1 bg-gray-100 rounded-md flex flex-col my-3 px-3 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-colors relative"
    >
      <TextInput
        ref="input"
        v-model="text"
        :placeholder="placeholder"
        autocomplete="off"
        inputClass="!bg-transparent !h-8 !p-0 !border-0 !outline-none !shadow-none !ring-0 !text-[13px] !text-gray-900 !placeholder-gray-500"
        @keydown="onKeydown"
      />

      <!-- Acciones -->
      <div class="flex justify-between items-center mt-1">
        <div class="flex items-center gap-1 -ml-2">
          <SecondaryButton
            type="button"
            class="!border-0 !bg-transparent !p-1.5 !text-gray-500 hover:!bg-gray-200 !rounded-full"
            title="Emoji"
          >
            <Smile :size="18" />
          </SecondaryButton>
          <SecondaryButton
            type="button"
            class="!border-0 !bg-transparent !p-1.5 !text-gray-500 hover:!bg-gray-200 !rounded-full"
            title="Adjuntar"
          >
            <Camera :size="18" />
          </SecondaryButton>
        </div>
        <SubmitButton
          type="submit"
          :block="false"
          class="!border-0 !bg-transparent !p-1.5 hover:!bg-gray-200 !rounded-full"
          :class="text.trim() ? '!text-blue-600' : '!text-gray-400'"
          :disabled="!text.trim()"
        >
          <Send :size="18" />
        </SubmitButton>
      </div>

      <!-- Dropdown local — solo aparece en ESTA instancia -->
      <div
        v-if="isSearching || suggestions.length"
        class="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10"
      >
        <!-- Skeletons -->
        <template v-if="isSearching">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 animate-pulse">
            <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
            <div class="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </template>

        <!-- Resultados -->
        <template v-else>
          <button
            v-for="user in suggestions"
            :key="user.id"
            type="button"
            class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-0 bg-transparent text-left cursor-pointer"
            @mousedown.prevent="chooseMention(user)"
          >
            <img
              :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`"
              :alt="user.name"
              class="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <span class="text-sm font-semibold text-gray-900">{{ user.name }}</span>
          </button>

          <div v-if="!suggestions.length && mentionQuery" class="p-3 text-center text-gray-500 text-sm">
            No se encontraron usuarios
          </div>
        </template>
      </div>
    </div>
  </form>
</template>
