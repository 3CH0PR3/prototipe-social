import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useActiveRoute() {
  const route = useRoute();

  const currentUri = computed(() => {
    return route.path.replace(/^\/|\/$/g, '');
  });

  const currentPath = (path) => {
    return route.path.includes(path);
  };

  const isActive = (uris) => {
    const uriArray = Array.isArray(uris) ? uris : [uris];

    return uriArray.some((uri) => {
      const cleanUri = uri.replace(/\*$/, '');
      return currentUri.value === cleanUri || currentUri.value.startsWith(`${cleanUri}/`);
    });
  };

  return {
    isActive,
    currentUri,
    currentPath,
  };
}
