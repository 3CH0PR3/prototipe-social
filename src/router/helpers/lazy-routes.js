export async function lazyLoadRoutes(glob) {
  const modules = await Promise.all(
    Object.values(glob).map((importFn) => importFn())
  );
  return modules.flatMap((m) => m.default || []);
}

export function createLazyChildrenLoader(glob) {
  let cachedRoutes = null;
  
  return async () => {
    if (!cachedRoutes) {
      cachedRoutes = await lazyLoadRoutes(glob);
    }
    return cachedRoutes;
  };
}
