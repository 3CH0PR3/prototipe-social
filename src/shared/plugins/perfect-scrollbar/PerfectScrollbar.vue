<script setup>
import { onMounted, onUnmounted, nextTick, ref, watch } from 'vue';

import PerfectScrollbarLib from 'perfect-scrollbar';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },

  tag: {
    type: String,
    default: 'div'
  },

  watchContent: {
    type: Boolean,
    default: true
  }
});

const container = ref(null);

let ps = null;

const initScrollbar = () => {
  if (!container.value) return;

  ps = new PerfectScrollbarLib(container.value, {
    suppressScrollX: true,
    wheelPropagation: false,
    ...props.options
  });
};

const updateScrollbar = async () => {
  await nextTick();

  ps?.update();
};

onMounted(() => {
  initScrollbar();
});

onUnmounted(() => {
  ps?.destroy();
  ps = null;
});

watch(
  () => props.watchContent,
  async (enabled) => {
    if (!enabled) return;

    await updateScrollbar();
  }
);

defineExpose({
  updateScrollbar
});
</script>

<template>
  <component :is="tag" ref="container" class="ps-container">
    <slot />
  </component>
</template>

<style scoped>
.ps-container {
  position: relative;
  overflow: hidden;
}

.ps-container :deep(.ps__thumb-y) {
  background-color: theme('colors.brand.600');
  width: 5px;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.ps-container:hover :deep(.ps__thumb-y) {
  opacity: 1;
}

.ps-container :deep(.ps__rail-y) {
  width: 3px;
  background-color: transparent !important;
  right: 2px;
}

.ps-container :deep(.ps__rail-y:hover),
.ps-container :deep(.ps__rail-y.ps--clicking) {
  background-color: transparent !important;
  width: 4px;
}

.ps-container :deep(.ps__rail-y:hover > .ps__thumb-y),
.ps-container :deep(.ps__rail-y.ps--clicking > .ps__thumb-y) {
  width: 7px;
  opacity: 1;
}

.ps-container :deep(.ps__thumb-x) {
  background-color: theme('colors.brand.600');
  height: 3px;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.ps-container:hover :deep(.ps__thumb-x) {
  opacity: 1;
}

.ps-container :deep(.ps__rail-x) {
  height: 3px;
  background-color: transparent !important;
  bottom: 2px;
}
</style>
