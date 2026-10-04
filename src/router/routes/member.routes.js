import { onlyGuest } from '../guards/guest.guard';
import { requireAuth } from '../guards/auth.guard';
import { requireTenantDomain } from '../guards/domain.guard';
import { createLazyChildrenLoader } from '../helpers/lazy-routes.js';

const sessionGlob = import.meta.glob('@member/pages/**/router/*.routes.js');
const authGlob = import.meta.glob('@member/auth/**/router/*.routes.js');

export async function buildRoutes() {
  const sessionLoader = createLazyChildrenLoader(sessionGlob);
  const authMods = await Promise.all(Object.values(authGlob).map((fn) => fn()));
  const authRoutes = authMods.flatMap((m) => m.default || []);

  return [
    {
      path: '/member',
      component: () => import('@layouts/member/MemberAuthLayout.vue'),
      redirect: { name: 'member.login' },
      meta: {
        middleware: [requireTenantDomain, onlyGuest],
      },
      children: authRoutes,
    },
    {
      path: '/member',
      name: 'member',
      component: () => import('@layouts/member/MemberLayout.vue'),
      redirect: { name: 'member.dashboard' },
      meta: {
        middleware: [requireTenantDomain, requireAuth],
        lazyChildren: sessionLoader,
      },
      children: [],
    },
  ];
}
