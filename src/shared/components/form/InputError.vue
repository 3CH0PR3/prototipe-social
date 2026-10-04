<script setup>
defineProps({
  message: { type: String, default: '' }
});
</script>

<template>
  <p v-if="message" class="text-[10px] md:text-xs font-normal text-rose-600 dark:text-rose-400" role="alert">
    {{ message }}
  </p>
</template>
