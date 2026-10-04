import { Http, API } from '@shared/http/Http';
import { getSubdomain, isTenantDomain } from '@shared/helpers/subdomain';
import { useTenantStore } from '@/stores/useTenantStore';

const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
let currentNavigationId = null;

const TENANT_ERROR_ROUTES = ['tenant-not-found', 'tenant-no-database'];
const TENANT_STATUS_ROUTES = ['tenant-inactive', 'tenant-expired', 'tenant-maintenance'];

export const blockCentralFromTenant = () => {
  if (isTenantDomain()) {
    return { name: 'not-found', replace: true };
  }
};

export const blockLandingFromTenant = () => {
  if (isTenantDomain()) {
    return { name: 'company.welcome', replace: true };
  }
};

export const requireTenantDomain = async (to) => {
  if (!isTenantDomain()) {
    return { name: 'not-found', replace: true };
  }

  const navigationId = `${to.fullPath}-${Date.now()}`;
  
  if (currentNavigationId === navigationId) {
    return;
  }
  
  currentNavigationId = navigationId;

  const subdomain = getSubdomain();
  const cached = tenantCache.get(subdomain);

  // Si ya está en caché, usar el valor cacheado
  if (cached === 'not-found') {
    // Verificar si el cache de error expiró (puede ser un error transitorio)
    const cachedAt = tenantCache.get(`${subdomain}:cachedAt`);
    if (cachedAt && Date.now() - cachedAt > CACHE_TTL) {
      tenantCache.delete(subdomain);
      tenantCache.delete(`${subdomain}:cachedAt`);
      // Continuar para re-validar
    } else {
      if (to.name !== 'tenant-not-found') return { name: 'tenant-not-found', replace: true };
      return;
    }
  }

  if (cached === 'no-database') {
    const cachedAt = tenantCache.get(`${subdomain}:cachedAt`);
    if (cachedAt && Date.now() - cachedAt > CACHE_TTL) {
      tenantCache.delete(subdomain);
      tenantCache.delete(`${subdomain}:cachedAt`);
      // Continuar para re-validar
    } else {
      if (to.name !== 'tenant-no-database') return { name: 'tenant-no-database', replace: true };
      return;
    }
  }

  if (cached === 'valid') {
    // Re-popula el store si recargó la página (el store se perdió pero el cache no)
    try {
      const tenantStore = useTenantStore();
      if (!tenantStore.id) {
        tenantStore.setFromPing({
          id: tenantCache.get(`${subdomain}:id`),
          subdomain,
          status_code: tenantCache.get(`${subdomain}:status`),
          has_active_plan: tenantCache.get(`${subdomain}:plan`)
        });
      }
    } catch {
      /* ignorar */
    }

    if (TENANT_ERROR_ROUTES.includes(to.name)) {
      return { name: 'company.welcome', replace: true };
    }
    const status = tenantCache.get(`${subdomain}:status`) ?? 1;
    const hasPlan = tenantCache.get(`${subdomain}:plan`) ?? false;

    if (status === 1 && (to.name === 'tenant-inactive' || to.name === 'tenant-maintenance')) {
      return { name: 'company.welcome', replace: true };
    }
    if (hasPlan && to.name === 'tenant-expired') {
      return { name: 'company.welcome', replace: true };
    }
    return;
  }

  // Si no hay caché, hacer la petición de validación
  try {
    const res = await Http.get(API.company.ping);

    // El response interceptor ya desenvuelve res.data,
    // así que res es directamente el objeto data
    const data = res?.data ?? res;

    // Validar que recibimos datos válidos del tenant
    if (!data || typeof data !== 'object') {
      console.error('[TENANT GUARD] Invalid response structure:', res);
      tenantCache.set(subdomain, 'not-found');
      if (to.name !== 'tenant-not-found') return { name: 'tenant-not-found', replace: true };
      return;
    }

    // Cachear información del tenant
    tenantCache.set(subdomain, 'valid');
    tenantCache.set(`${subdomain}:id`, data?.id ?? null);
    tenantCache.set(`${subdomain}:status`, data?.status_code ?? 1);
    tenantCache.set(`${subdomain}:plan`, data?.has_active_plan ?? true);

    // Popula el store de tenant para que los componentes lo usen
    try {
      const tenantStore = useTenantStore();
      tenantStore.setFromPing(data);
    } catch {
      /* pinia puede no estar lista en SSR/tests */
    }

    // Redirigir desde rutas de error si el tenant es válido
    if (TENANT_ERROR_ROUTES.includes(to.name)) {
      return { name: 'company.welcome', replace: true };
    }
    if (data?.status_code === 1 && (to.name === 'tenant-inactive' || to.name === 'tenant-maintenance')) {
      return { name: 'company.welcome', replace: true };
    }
    if (data?.has_active_plan && to.name === 'tenant-expired') {
      return { name: 'company.welcome', replace: true };
    }
  } catch (error) {
    console.error('[TENANT GUARD] Ping failed:', error);

    const status = error?.response?.status;

    // Manejar error 503 (base de datos no existe)
    if (status === 503) {
      tenantCache.set(subdomain, 'no-database');
      tenantCache.set(`${subdomain}:cachedAt`, Date.now());
      if (to.name !== 'tenant-no-database') return { name: 'tenant-no-database', replace: true };
      return;
    }

    // Manejar error 404 o cualquier otro error como tenant no encontrado
    if (status === 404 || !status) {
      tenantCache.set(subdomain, 'not-found');
      tenantCache.set(`${subdomain}:cachedAt`, Date.now());
      if (to.name !== 'tenant-not-found') return { name: 'tenant-not-found', replace: true };
      return;
    }

    // Para otros errores (500, etc.), también marcar como no encontrado
    tenantCache.set(subdomain, 'not-found');
    tenantCache.set(`${subdomain}:cachedAt`, Date.now());
    if (to.name !== 'tenant-not-found') return { name: 'tenant-not-found', replace: true };
    return;
  }
};

export const requireTenantDomainOnly = () => {
  if (!isTenantDomain()) {
    return { name: 'not-found', replace: true };
  }
};

export const clearTenantCache = () => tenantCache.clear();

export const getTenantId = () => {
  const subdomain = getSubdomain();
  return tenantCache.get(`${subdomain}:id`) ?? null;
};

/**
 * Lee del cache (ya populado por requireTenantDomain).
 * Sin segundo ping. Solo para rutas /auth.
 */
export const requireTenantService = () => {
  const subdomain = getSubdomain();
  const status = tenantCache.get(`${subdomain}:status`) ?? 0;
  const hasPlan = tenantCache.get(`${subdomain}:plan`) ?? false;

  if (status !== 1) return { name: 'tenant-inactive', replace: true };
  if (!hasPlan) return { name: 'tenant-expired', replace: true };
};
