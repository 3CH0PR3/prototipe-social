export async function runMiddlewares(to) {
  const middlewares = [];

  for (const route of to.matched) {
    const routeMiddlewares = route.meta?.middleware;

    if (!routeMiddlewares) continue;

    middlewares.push(...(Array.isArray(routeMiddlewares) ? routeMiddlewares : [routeMiddlewares]));
  }

  for (const middleware of middlewares) {
    if (typeof middleware !== 'function') continue;

    const redirect = await middleware(to);

    if (redirect) return redirect;
  }
}
