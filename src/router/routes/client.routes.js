import { onlyGuest } from '../guards/guest.guard';
import { requireAuth } from '../guards/auth.guard';
import { requireTenantDomain } from '../guards/domain.guard';
import { createLazyChildrenLoader } from '../helpers/lazy-routes.js';

const sessionGlob = import.meta.glob('@client/pages/**/router/*.routes.js');
const authGlob    = import.meta.glob('@client/auth/**/router/*.routes.js');

export async function buildRoutes() {
  const sessionLoader = createLazyChildrenLoader(sessionGlob);
  const authMods = await Promise.all(Object.values(authGlob).map((fn) => fn()));
  const authRoutes = authMods.flatMap((m) => m.default || []);

  return [
    {
      path: '/client',
      component: () => import('@layouts/client/ClientAuthLayout.vue'),
      redirect: { name: 'client.login' },
      meta: { 
        middleware: [requireTenantDomain, onlyGuest],
      },
      children: authRoutes,
    },
    {
      path: '/client',
      name: 'client',
      component: () => import('@layouts/client/ClientLayout.vue'),
      redirect: { name: 'client.dashboard' },
      meta: { 
        middleware: [requireTenantDomain, requireAuth],
        lazyChildren: sessionLoader,
      },
      children: [],
    },
  ];
}
