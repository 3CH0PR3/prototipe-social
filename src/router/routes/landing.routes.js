import { onlyGuest } from '@router/guards/guest.guard';
import { blockLandingFromTenant } from '@router/guards/domain.guard';

const featureGlob = import.meta.glob('@landing/**/router/*.routes.js');

export async function buildRoutes() {
  const mods = await Promise.all(Object.values(featureGlob).map((fn) => fn()));
  const allRoutes = mods.flatMap((m) => m.default || []);

  const authRoutes   = allRoutes.filter((route) => route.path === '/company');
  const normalRoutes = allRoutes.filter((route) => route.path !== '/company');

  return [
    {
      path: '/',
      component: () => import('@layouts/landing/LandingLayout.vue'),
      meta: { middleware: [blockLandingFromTenant, onlyGuest] },
      children: normalRoutes,
    },
    {
      path: '/',
      component: () => import('@layouts/landing/LandingAuthLayout.vue'),
      meta: { middleware: [blockLandingFromTenant] },
      children: authRoutes,
    },
  ];
}
