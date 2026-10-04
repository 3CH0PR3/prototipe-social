<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: Number, default: 22 },
  href: { type: String, default: '#' },
  fontSize: { type: Number, default: null },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  exact: { type: Boolean, default: false }
});

const isCurrent = computed(() => {
  if (!props.href) return false;
  if (props.exact) {
    return route.path === props.href;
  }
  return route.path.startsWith(props.href);
});
</script>

<template>
  <router-link
    v-if="!isCurrent && !disabled"
    :to="href"
    :class="{ active: active || isCurrent }"
    class="menu-link d-flex align-items-center"
  >
    <i
      v-if="icon"
      :class="[icon]"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: fontSize ? `${fontSize}px` : undefined
      }"
    />
    <slot />
  </router-link>

  <div v-else class="menu-link d-flex align-items-center active">
    <i
      v-if="icon"
      :class="[icon]"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: fontSize ? `${fontSize}px` : undefined
      }"
    />
    <slot />
  </div>
</template>
