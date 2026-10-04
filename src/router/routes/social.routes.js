import { requireAuth } from '../guards/auth.guard';
import { onlyGuest } from '../guards/guest.guard';
import { blockCentralFromTenant } from '../guards/domain.guard';

const sessionGlob = import.meta.glob('@social/pages/**/router/*.routes.js');
const authGlob    = import.meta.glob('@social/auth/**/router/*.routes.js');
const landingGlob = import.meta.glob('@social/landing/**/router/*.routes.js');

export async function buildRoutes() {
  const [sessionMods, authMods, landingMods] = await Promise.all([
    Promise.all(Object.values(sessionGlob).map((fn) => fn())),
    Promise.all(Object.values(authGlob).map((fn) => fn())),
    Promise.all(Object.values(landingGlob).map((fn) => fn())),
  ]);

  return [
    {
      path: '/social',
      name: 'social.root',
      meta: { middleware: [blockCentralFromTenant, onlyGuest] },
      children: landingMods.flatMap((m) => m.default || []),
    },
    {
      path: '/social',
      component: () => import('@layouts/social/SocialAuthLayout.vue'),
      meta: { middleware: [blockCentralFromTenant, onlyGuest] },
      children: authMods.flatMap((m) => m.default || []),
    },
    {
      path: '/social',
      name: 'social',
      component: () => import('@layouts/social/SocialLayout.vue'),
      redirect: { name: 'social.feed' },
      meta: { middleware: [blockCentralFromTenant, requireAuth] },
      children: sessionMods.flatMap((m) => m.default || []),
    },
  ];
}
