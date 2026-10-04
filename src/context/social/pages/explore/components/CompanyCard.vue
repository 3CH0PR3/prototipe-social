<script setup>
import { computed } from 'vue';
import { Building2 } from '@lucide/vue';
import SubmitButton from '@shared/components/button/SubmitButton.vue';
import imgProfileDefault from '@social/assets/img/default.svg';

const props = defineProps({
  company: { type: Object, required: true }
});

const emit = defineEmits(['removeSuggestion', 'follow']);

const avatarSrc = computed(() => props.company.avatar || imgProfileDefault);
const displayName = computed(() => props.company.name);
const companyLink = computed(() => ({
  name: 'social.explore' // Temporarily point to explore until company profile page is ready
}));
</script>

<template>
  <article class="soc-card person-card !shadow">
    <router-link :to="companyLink" class="person-card-link">
      <div class="person-card-image-wrapper bg-gray-100 flex items-center justify-center">
        <img
          v-if="props.company.avatar"
          :src="avatarSrc"
          :alt="displayName"
          class="person-card-image"
          loading="lazy"
          @error="$event.target.src = imgProfileDefault"
        />
        <Building2 v-else class="text-gray-400 w-16 h-16" />
      </div>
    </router-link>

    <!-- Info -->
    <div class="person-card-info">
      <router-link :to="companyLink" class="person-card-name text-center" :title="displayName">
        {{ displayName }}
      </router-link>

      <!-- Subtexto -->
      <div>
        <span class="person-card-text-light">Empresa</span>
      </div>

      <!-- Acciones -->
      <div class="person-card-actions">
        <SubmitButton @click="emit('follow', company.id)">Seguir</SubmitButton>
        <button class="person-card-btn-secondary" @click="emit('removeSuggestion', company.id)">
          Eliminar
        </button>
      </div>
    </div>
  </article>
</template>
