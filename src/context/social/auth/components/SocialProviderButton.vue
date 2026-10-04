<script setup>
import { Loader2 } from '@lucide/vue';

defineProps({
  provider: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const getProviderConfig = (provider) => {
  const configs = {
    google: {
      icon: ['fab', 'google'],
      colorClass: 'text-[#EA4335]',
      hoverClass: 'hover:border-[#EA4335]/30'
    },
    github: {
      icon: ['fab', 'github'],
      colorClass: 'text-text-primary',
      hoverClass: 'hover:border-text-primary/30'
    },
    azure: {
      icon: ['fab', 'windows'],
      colorClass: 'text-[#00A4EF]',
      hoverClass: 'hover:border-[#00A4EF]/30'
    }
  };
  return configs[provider] || configs.github;
};
</script>

<template>
  <a
    :href="href"
    @click="emit('click', $event)"
    :class="[
      'group soc-auth-provider-btn',
      getProviderConfig(provider).hoverClass,
      { 'soc-auth-provider-btn-disabled': isDisabled }
    ]"
  >
    <Loader2
      v-if="isLoading"
      class="soc-auth-provider-loader"
      :class="getProviderConfig(provider).colorClass"
    />
    <font-awesome-icon
      v-else
      :icon="getProviderConfig(provider).icon"
      class="soc-auth-provider-icon"
      :class="getProviderConfig(provider).colorClass"
    />
    <span>{{ label }}</span>
  </a>
</template>
