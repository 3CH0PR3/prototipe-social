import { onlyGuest } from '../guards/guest.guard';
import { requireAuth } from '../guards/auth.guard';
import { blockCentralFromTenant } from '../guards/domain.guard';

const authGlob    = import.meta.glob('@central/auth/**/router/*.routes.js');
const sessionGlob = import.meta.glob('@central/pages/**/router/*.routes.js');

export async function buildRoutes() {
  const [authMods, sessionMods] = await Promise.all([
    Promise.all(Object.values(authGlob).map((fn) => fn())),
    Promise.all(Object.values(sessionGlob).map((fn) => fn())),
  ]);

  return [
    {
      path: '/central',
      component: () => import('@layouts/central/CentralAuthLayout.vue'),
      meta: { middleware: [blockCentralFromTenant, onlyGuest] },
      children: authMods.flatMap((m) => m.default || []),
    },
    {
      path: '/central',
      name: 'central',
      component: () => import('@layouts/central/CentralLayout.vue'),
      meta: { middleware: [blockCentralFromTenant, requireAuth] },
      children: sessionMods.flatMap((m) => m.default || []),
    },
  ];
}
