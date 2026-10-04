import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { clearTenantCache } from '@/router/guards/domain.guard';
import { getSubdomain } from '@/shared/helpers/subdomain';
const SESSION_KEYS = {
  central: 'sid_central',
  company: 'sid_company',
  member: 'sid_member',
  social: 'sid_social'
};

/**
 * Detecta el contexto basándose en el pathname y hostname actuales.
 * Se llama dinámicamente — no queda fijo al montar el store.
 */
export const detectContext = () => {
  const path = window.location.pathname;
  
  if (path.startsWith('/member')) return 'member';
  if (path.startsWith('/social')) return 'social';
  if (getSubdomain() !== null) return 'company';
  return 'central';
};

export const useTokenStore = defineStore('auth.token', () => {
  // ── token reactivo por contexto ────────────────────────────────────────────
  // Cada contexto tiene su propia entrada en localStorage.
  // `token` y `exists` se evalúan contra el contexto de la URL actual.

  const _tokens = ref({
    central: localStorage.getItem(SESSION_KEYS.central) ?? null,
    company: localStorage.getItem(SESSION_KEYS.company) ?? null,
    member: localStorage.getItem(SESSION_KEYS.member) ?? null,
    social: localStorage.getItem(SESSION_KEYS.social) ?? null
  });

  // El token del contexto activo en este momento
  const token = computed(() => {
    const ctx = detectContext();
    return _tokens.value[ctx] ?? null;
  });

  const exists = computed(() => !!token.value);

  // Obtener el token de un contexto específico (para el request interceptor)
  const getToken = (context) => {
    const token = _tokens.value[context] ?? null;
    return token;
  };

  const set = (value, context) => {
    const ctx = context ?? detectContext();
    _tokens.value[ctx] = value;
    localStorage.setItem(SESSION_KEYS[ctx], value);
  };

  const setRefresh = (value) => {
    if (value === null || value === undefined) {
      localStorage.removeItem('refresh_token');
    } else {
      localStorage.setItem('refresh_token', value);
    }
  };

  const getRefresh = () => localStorage.getItem('refresh_token') ?? null;

  const clear = (context) => {
    const ctx = context ?? detectContext();
    _tokens.value[ctx] = null;
    localStorage.removeItem(SESSION_KEYS[ctx]);

    if (ctx === 'company' || ctx === 'central') {
      localStorage.removeItem('refresh_token');
    }

    if (ctx === 'company' || ctx === 'member') {
      clearTenantCache();
    }
  };

  const clearAll = () => {
    Object.keys(SESSION_KEYS).forEach((ctx) => {
      _tokens.value[ctx] = null;
      localStorage.removeItem(SESSION_KEYS[ctx]);
    });
    localStorage.removeItem('refresh_token');
    clearTenantCache();
  };

  const updateContext = () => {};

  return {
    token,
    exists,
    getToken,
    getRefresh,
    set,
    setRefresh,
    clear,
    clearAll,
    updateContext
  };
});
