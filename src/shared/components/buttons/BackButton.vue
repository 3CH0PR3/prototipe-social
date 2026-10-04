<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@lucide/vue';

const props = defineProps({
  to: { type: [String, Object], default: null }
});

const router = useRouter();

const go = () => {
  props.to ? router.push(props.to) : router.back();
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    go();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <button
    class="rounded-md border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
    @click="go"
  >
    <ArrowLeft class="h-4 w-4" />
  </button>
</template>
