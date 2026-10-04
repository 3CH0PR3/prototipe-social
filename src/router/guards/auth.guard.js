import { useTokenStore } from '@/stores/useToken.store';
import { getContextFromRoute, getAuthStore } from '@shared/helpers/guards';

const LOGIN_ROUTE = {
  central: 'central.login',
  company: 'company.login',
  social: 'social.login',
  member: 'member.login',
  client: 'client.login'
};

export const requireAuth = async (to) => {
  const tokenStore = useTokenStore();
  const context = getContextFromRoute(to);

  // Verificar el token del contexto correcto — no el computed dinámico
  const token = tokenStore.getToken(context);

  if (!token) {
    return { name: LOGIN_ROUTE[context] ?? 'central.login' };
  }

  try {
    const authStore = await getAuthStore(context);

    // Si ya está autenticado y la sesión ya fue chequeada, no volver a verificar
    if (authStore.isAuthenticated && authStore.isSessionChecked) {
      return;
    }

    await authStore.checkSession();
  } catch (err) {
    return { name: LOGIN_ROUTE[context] ?? 'central.login' };
  }
};
