import { useTokenStore } from '@/stores/useToken.store';
import { getContextFromRoute, getAuthStore } from '@shared/helpers/guards';

const HOME_ROUTE = {
  central: 'central.dashboard',
  company: 'company.dashboard',
  social: 'social.feed',
  member: 'member.dashboard',
  client: 'client.dashboard'
};

export const requireGuest = async (to) => {
  const tokenStore = useTokenStore();
  const context = getContextFromRoute(to);
  const token = tokenStore.getToken(context);

  if (!token) return;

  try {
    const authStore = await getAuthStore(context);

    if (!authStore.isSessionChecked) {
      await authStore.checkSession();
    }

    if (authStore.isAuthenticated) {
      return { name: HOME_ROUTE[context] ?? 'server-error' };
    }
  } catch (err) { return; }
};

export const onlyGuest = requireGuest;
