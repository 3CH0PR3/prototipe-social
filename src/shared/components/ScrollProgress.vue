<script setup>
import { onMounted, onUnmounted } from 'vue';

function updateScrollProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const bar = document.getElementById('scrollProgress');
  if (bar) {
    bar.style.width = `${scrollPercent}%`;
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress);
});
</script>

<template>
  <div class="fixed left-0 top-[70px] z-[9999] h-px w-full bg-yw-main/20">
    <div id="scrollProgress" class="h-full w-0 bg-yw-main transition-[width] duration-200 ease-linear" />
  </div>
</template>
