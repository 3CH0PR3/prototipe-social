<script setup>
import { useRouter } from 'vue-router';
import { MapPin, Globe2, Edit3, Link, Calendar } from '@lucide/vue';
import FriendsPreviewCard from './FriendsPreviewCard.vue';

const props = defineProps({
  person: { type: Object, default: () => ({}) },
  isMe: { type: Boolean, default: false },
  personId: { type: String, default: null }
});

defineEmits(['openEdit']);

const router = useRouter();

const goToInfo = () => router.push({ name: 'social.profile.info' });

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<template>
  <aside class="flex flex-col gap-4 pb-2">
    <!-- Card de  rápida -->
    <div class="soc-card p-2 md:p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-md font-medium text-text-primary"></h2>
        <button
          v-if="isMe"
          type="button"
          class="p-1.5 rounded-lg border-0 bg-transparent cursor-pointer text-text-muted hover:text-brand hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
          @click="$emit('openEdit')"
        >
          <Edit3 :size="18" />
        </button>
      </div>

      <!-- Bio -->
      <p v-if="person?.bio" class="text-sm text-text-secondary mb-3 leading-relaxed">
        {{ person.bio }}
      </p>

      <div class="flex flex-col gap-2.5 mb-4">
        <div v-if="person?.location" class="flex items-center gap-2.5 text-sm text-text-secondary">
          <MapPin :size="17" class="text-text-muted shrink-0" />
          <span>{{ person.location }}</span>
        </div>

        <div v-if="person?.website_url" class="flex items-center gap-2.5 text-sm">
          <Link :size="17" class="text-text-muted shrink-0" />
          <a
            :href="person.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-brand hover:underline truncate"
          >
            {{ person.website_url }}
          </a>
        </div>

        <div
          v-if="person?.personal_information?.birth_date || person?.birthdate"
          class="flex items-center gap-2.5 text-sm text-text-secondary"
        >
          <Calendar :size="17" class="text-text-muted shrink-0" />
          <span>{{ formatDate(person.personal_information?.birth_date || person.birthdate) }}</span>
        </div>

        <!-- Placeholder si no hay nada -->
        <p
          v-if="!person?.bio && !person?.location && !person?.website_url"
          class="text-sm text-text-muted italic"
        >
          Sin  añadida
        </p>
      </div>

      <button
        type="button"
        class="w-full py-2 text-sm font-semibold text-text-secondary bg-surface-alt hover:bg-border rounded-xl border-0 cursor-pointer transition-colors"
        @click="goToInfo"
      >
        Ver toda la 
      </button>
    </div>

    <!-- Card de amigos preview -->
    <FriendsPreviewCard :person-id="personId" :is-me="isMe" />
  </aside>
</template>
