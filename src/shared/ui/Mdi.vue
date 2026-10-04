<script setup>
import SvgIcon from '@jamescoyle/vue-icon';

defineProps({
  path: {
    type: String,
    required: true
  },

  size: {
    type: [String, Number],
    default: 20
  },

  color: {
    type: String,
    default: 'currentColor'
  }
});
</script>

<template>
  <SvgIcon type="mdi" :path="path" :size="size" :color="color" />
</template>
