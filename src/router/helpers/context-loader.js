const loadedContexts = new Set();

const CONTEXT_MAP = {
  member: '../routes/member.routes.js',
  client: '../routes/client.routes.js',
};

export function detectContext(path) {
  if (path.startsWith('/company')) return 'company';
  if (path.startsWith('/member')) return 'member';
  if (path.startsWith('/client')) return 'client';
  if (path.startsWith('/welcome')) return 'company';
  if (path.startsWith('/auth')) return 'company';
  if (path === '/') return 'company';
  return null;
}

export async function loadContextModule(router, contextName) {
  if (contextName === 'company' || loadedContexts.has(contextName)) {
    return;
  }

  const modulePath = CONTEXT_MAP[contextName];
  if (!modulePath) return;

  try {
    const { buildRoutes } = await import(/* @vite-ignore */ modulePath);
    const routes = await buildRoutes();

    routes.forEach(route => router.addRoute(route));
    loadedContexts.add(contextName);
  } catch (error) {
    console.error(`[CONTEXT-LOADER] Error loading ${contextName}:`, error);
  }
}
