<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import FontAwesomeIcon from '@shared/components/icons/FontAwesomeIcon.vue';

const props = defineProps({
  href: { type: String, default: '' },
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  exact: Boolean
});

const route = useRoute();

const isCurrent = computed(() => {
  if (!props.href) return false;

  const currentLastPart = route.path.split('/').pop();
  const hrefLastPart = props.href.split('/').pop();

  return currentLastPart === hrefLastPart;
});
</script>

<template>
  <div
    :class="[
      'dropdown-shortcuts-item col m-0 border border-secondary border-opacity-10 rounded',
      { active: isCurrent }
    ]"
  >
    <router-link :to="{ name: props.href }" class="d-flex flex-column link">
      <span class="dropdown-shortcuts-icon rounded-circle mb-3">
        <FontAwesomeIcon
          :icon="icon"
          :size="16"
          :color="isCurrent ? 'var(--bs-menu-active-color)' : 'currentColor'"
        />
      </span>

      <span :class="['title', { 'text-primary': isCurrent }]">
        {{ title }}
      </span>

      <small :class="['description', { 'text-primary': isCurrent }]">
        {{ description }}
      </small>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.dropdown-shortcuts-item {
  &.active {
    background-color: var(--bs-menu-active-bg);

    .title,
    .description {
      color: var(--bs-menu-active-color) !important;
    }

    .dropdown-shortcuts-icon {
      color: red !important;
      // color: var(--bs-menu-active-color) !important;
    }
  }

  &:hover {
    background-color: var(--bs-menu-hover-bg) !important;

    .title,
    .description {
      color: var(--bs-menu-active-color) !important;
    }

    .dropdown-shortcuts-icon {
      color: var(--bs-menu-active-color) !important;
    }
  }
}

.dropdown-link {
  color: inherit;
  text-decoration: none;

  .title,
  .description {
    transition: color 0.2s ease;
  }

  .dropdown-shortcuts-icon {
    transition: color 0.2s ease;
  }
}
</style>
