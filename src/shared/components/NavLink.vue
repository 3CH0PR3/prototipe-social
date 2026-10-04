<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const route = useRoute();
const router = useRouter();
const attrs = useAttrs();

const props = defineProps({
  to: { type: Object, default: () => {} },
  active: { type: Boolean, default: false },
  exact: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  unstyled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
});

const sidebarClass = computed(() => {
  const base = 'flex items-center rounded py-2.5 text-sm transition-all duration-150';
  const active = props.active ? 'nav-link-active cursor-default select-none' : 'nav-link-inactive';
  const layout = props.compact ? 'w-full justify-center' : 'w-full gap-3 px-3';
  return `${base} ${active} ${layout}`;
});

const rootClass = computed(() => {
  const extra = attrs.class;
  const extraClass = Array.isArray(extra) ? extra.join(' ') : (extra ?? '');
  if (props.unstyled) return extraClass || undefined;
  return [sidebarClass.value, extraClass].filter(Boolean).join(' ');
});

const isCurrent = computed(() => {
  if (!props.to || props.disabled) return false;
  const resolved = router.resolve(props.to);
  const current = route.path.replace(/\/$/, '') || '/';
  const target = resolved.path.replace(/\/$/, '') || '/';
  if (props.exact) return current === target;
  return current === target || current.startsWith(`${target}/`);
});
</script>

<template>
  <router-link v-if="!isCurrent && !disabled" :to="to" :class="rootClass" v-bind="$attrs">
    <slot />
  </router-link>
  <span v-else :class="rootClass" aria-current="page" v-bind="$attrs">
    <slot />
  </span>
</template>
