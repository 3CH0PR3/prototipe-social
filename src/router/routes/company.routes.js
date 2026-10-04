import { onlyGuest } from '../guards/guest.guard';
import { requireAuth } from '../guards/auth.guard';
import { requireTenantDomain, requireTenantService } from '../guards/domain.guard';
import { createLazyChildrenLoader } from '../helpers/lazy-routes.js';

const sessionGlob = import.meta.glob('@company/pages/**/router/*.routes.js');
const authGlob    = import.meta.glob('@company/auth/**/router/*.routes.js');
const landingGlob = import.meta.glob('@company/welcome/**/router/*.routes.js');

export async function buildRoutes() {
  const landingLoader = createLazyChildrenLoader(landingGlob);
  
  const [sessionMods, authMods] = await Promise.all([
    Promise.all(Object.values(sessionGlob).map((fn) => fn())),
    Promise.all(Object.values(authGlob).map((fn) => fn())),
  ]);
  
  const sessionRoutes = sessionMods.flatMap((m) => m.default || []);
  const authRoutes = authMods.flatMap((m) => m.default || []);

  return [
    {
      path: '/',
      redirect: '/welcome'
    },
    {
      path: '/welcome',
      component: () => import('@layouts/company/CompanyLandingLayout.vue'),
      meta: {
        middleware: [requireTenantDomain, onlyGuest],
        lazyChildren: landingLoader,
      },
      children: [],
    },
    {
      path: '/auth',
      component: () => import('@layouts/company/CompanyAuthLayout.vue'),
      meta: {
        middleware: [requireTenantDomain, requireTenantService, onlyGuest],
      },
      children: authRoutes,
    },
    {
      path: '/company',
      name: 'company',
      component: () => import('@layouts/company/CompanyLayout.vue'),
      redirect: { name: 'company.dashboard' },
      meta: {
        middleware: [requireTenantDomain, requireTenantService, requireAuth],
      },
      children: sessionRoutes,
    },
  ];
}
