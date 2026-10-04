import { useTokenStore } from '@/stores/useToken.store';

/**
 * Wrapper síncrono sobre el store de token.
 * Pinia debe estar activa antes de llamar cualquier método.
 */
export const token = {
  get: () => useTokenStore().token,
  set: (value) => useTokenStore().set(value),
  remove: () => useTokenStore().clear(),
  exists: () => useTokenStore().exists
};
