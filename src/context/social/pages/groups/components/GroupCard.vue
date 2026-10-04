<script setup>
import { Users, Check, Plus, Image as ImageIcon } from '@lucide/vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

defineEmits(['click', 'toggle-membership']);
</script>

<template>
  <article
    class="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center p-4 gap-4 group"
    @click="$emit('click')"
  >
    <div class="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <img
        v-if="group.cover_url || group.cover"
        :src="group.cover_url || group.cover"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <ImageIcon :size="24" />
      </div>
    </div>

    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <h3
        class="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors truncate"
      >
        {{ group.name }}
      </h3>
      <p class="text-sm text-gray-500 mt-1 flex items-center gap-1">
        {{ group.visibility === 'private' ? 'Privado' : 'Público' }} &middot;
        {{ group.members || 1 }} miembros
      </p>
      <p class="text-sm text-gray-600 mt-1 line-clamp-1">
        {{ group.description || group.category || 'Comunidad general' }}
      </p>
    </div>

    <div class="shrink-0 flex items-center ml-2">
      <button
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        :class="
          group.joined
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'bg-green-600 text-white hover:bg-green-700'
        "
        type="button"
        @click.stop="$emit('toggle-membership')"
      >
        <component :is="group.joined ? Check : Plus" :size="16" />
        <span class="hidden sm:inline">{{ group.joined ? 'Eres miembro' : 'Unirme' }}</span>
      </button>
    </div>
  </article>
</template>
