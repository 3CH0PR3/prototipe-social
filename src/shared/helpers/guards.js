import { isTenantDomain } from './subdomain';

const PATH_PREFIXES = [
  ['/social', 'social'],
  ['/member', 'member'],
  ['/client', 'client']
];

export const getContextFromRoute = (route) => {
  const path = route.path;

  const byPath = PATH_PREFIXES.find(([prefix]) => path.startsWith(prefix))?.[1];
  if (byPath) return byPath;

  // Si estamos en tenant domain (con subdomain), es company
  // A menos que sea social o member (ya detectados arriba)
  if (isTenantDomain()) return 'company';

  // Por defecto es central (sin subdomain)
  return 'central';
};

const AUTH_STORE_IMPORTS = {
  social: () => import('@authSocial/stores/useAuth.store'),
  member: () => import('@authMember/stores/useAuth.store'),
  central: () => import('@authCentral/stores/useAuth.store'),
  company: () => import('@authCompany/stores/useAuth.store'),
  client: () => import('@client/auth/stores/useAuth.store')
};

const USER_STORE_IMPORTS = {
  central: () => import('@central/pages/user/stores/useUser.store'),
  company: () => import('@company/pages/user/stores/useUser.store'),
  social: () => import('@social/pages/user/stores/useUser.store'),
  member: () => import('@member/pages/user/stores/useUser.store'),
  client: () => import('@client/pages/user/stores/useUser.store')
};

export const getAuthStore = async (context) => {
  const { useAuthStore } = await AUTH_STORE_IMPORTS[context]();
  return useAuthStore(); // Pinia ya maneja el singleton
};

export const getUserStore = async (context) => {
  const { useUserStore } = await USER_STORE_IMPORTS[context]();
  return useUserStore(); // Pinia ya maneja el singleton
};
