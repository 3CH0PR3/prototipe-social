const loadedLazyRoutes = new WeakMap();

async function loadLazyChildren(route) {
  if (!route.meta?.lazyChildren || loadedLazyRoutes.has(route)) {
    return;
  }

  try {
    const loader = route.meta.lazyChildren;
    const children = await loader();

    if (children?.length > 0) {
      route.children = children;
      loadedLazyRoutes.set(route, true);
    }
  } catch (error) {
    console.error(`[LAZY-CHILDREN] Error loading children for ${route.path}:`, error);
  }
}

export async function loadAllLazyChildren(matched) {
  for (const route of matched) {
    await loadLazyChildren(route);
  }
}
