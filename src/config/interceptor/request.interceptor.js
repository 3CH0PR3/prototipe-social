import { useTokenStore, detectContext } from '@/stores/useToken.store';
import { getSubdomain } from '@shared/helpers/subdomain';

/**
 * Determina el contexto de autenticación a partir de la URL de la petición.
 * Si la URL contiene '/member/', es contexto member.
 * Si la URL contiene '/social/', es contexto social.
 * Si tiene subdomain (tenant), es company.
 * Sino, central.
 */
const getContextFromUrl = (url = '') => {
  if (url.includes('/member/')) return 'member';
  if (url.includes('/social/')) return 'social';
  if (getSubdomain()) return 'company';
  return 'central';
};

export function setupRequestInterceptor(client) {
  client.interceptors.request.use((config) => {
    const tokenStore = useTokenStore();

    // Determinar contexto por la URL de la petición
    const ctx = getContextFromUrl(config.url ?? '');
    const token = tokenStore.getToken(ctx);

    if (token) config.headers.Authorization = `Bearer ${token}`;

    const subdomain = getSubdomain();
    if (subdomain) config.headers['X-Tenant'] = subdomain;

    return config;
  });
}
