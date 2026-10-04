import { isTenantDomain } from '@shared/helpers/subdomain.js';
import { detectContext, loadContextModule } from './context-loader.js';
import { loadAllLazyChildren } from './lazy-children-loader.js';
import { runMiddlewares } from '../middleware/pipeline.js';
import nProgress from 'nprogress';

export function createNavigationHandler(router) {
  return async function handleNavigation(to, from) {
    if (to.fullPath !== from.fullPath) nProgress.start();

    document.title = `${to.meta?.title} | GEA-WRC`;

    if (isTenantDomain()) {
      const context = detectContext(to.path);
      if (context) {
        await loadContextModule(router, context);
      }
    }

    await loadAllLazyChildren(to.matched);

    try {
      const redirect = await runMiddlewares(to);
      if (redirect) return redirect;
    } catch (error) {
      console.error('[ROUTER] Error in middleware:', error);
      const status = error?.response?.status || error?.status;

      if (error?.config?.url?.includes('/ping')) {
        console.error('[ROUTER] Tenant ping failed:', {
          status,
          subdomain: window.location.hostname.split('.')[0],
          url: error?.config?.url,
          error: error?.response?.data || error?.message,
        });
      }

      if (status === 404) return { name: 'not-found' };
      if (status === 401 || status === 403) return;
      if (status >= 500) return { name: 'internal-server-error' };
    }
  };
}
