<script setup>
import { Camera } from '@lucide/vue';

defineProps({
  currentUser: Object
});
defineEmits(['openComposer']);
</script>

<template>
  <div class="soc-profile-composer" @click="$emit('openComposer')">
    <img :src="currentUser?.avatar" alt="" class="soc-profile-composer-avatar" />
    <div class="soc-profile-composer-input">Que estas pensando?</div>
    <button type="button" class="soc-profile-composer-action">
      <Camera :size="20" />
      <span class="text-[10px] font-medium hidden sm:block">Foto</span>
    </button>
  </div>
</template>
