import { createRouter, createWebHistory } from 'vue-router';
import { isTenantDomain } from '@shared/helpers/subdomain.js';
import { createNavigationHandler } from './helpers/navigation-handler.js';
import { handleModuleLoadError } from './helpers/error-handler.js';
import nProgress from 'nprogress';

async function loadContextRoutes() {
  const { default: errorsRoutes } = await import('./routes/errors.routes.js');

  if (isTenantDomain()) {
    const [
      { buildRoutes: buildCompany },
      { buildRoutes: buildMember },
      { buildRoutes: buildClient },
    ] = await Promise.all([
      import('./routes/company.routes.js'),
      import('./routes/member.routes.js'),
      import('./routes/client.routes.js'),
    ]);

    const [company, member, client] = await Promise.all([
      buildCompany(),
      buildMember(),
      buildClient(),
    ]);

    return [...errorsRoutes, ...company, ...member, ...client];
  }

  const [
    { buildRoutes: buildLanding },
    { buildRoutes: buildCentral },
    { buildRoutes: buildSocial },
  ] = await Promise.all([
    import('./routes/landing.routes.js'),
    import('./routes/central.routes.js'),
    import('./routes/social.routes.js'),
  ]);

  const [landing, central, social] = await Promise.all([
    buildLanding(),
    buildCentral(),
    buildSocial(),
  ]);

  return [...errorsRoutes, ...landing, ...central, ...social];
}

export async function createAppRouter() {
  const routes = await loadContextRoutes();

  const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.matched[0]?.path === from.matched[0]?.path) return false;
      return { top: 0, behavior: 'smooth' };
    },
    routes,
  });

  router.beforeEach(createNavigationHandler(router));
  router.onError(handleModuleLoadError);
  router.afterEach(() => nProgress.done());

  return router;
}
