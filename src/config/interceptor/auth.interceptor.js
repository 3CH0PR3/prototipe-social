import axios from 'axios';
import { useTokenStore, detectContext } from '@/stores/useToken.store';
import { getSubdomain } from '@shared/helpers/subdomain';

// ── Cola de peticiones en espera durante el refresh ───────────────────────────
let isRefreshing = false;
let failedQueue = [];

const enqueueRequest = (resolve, reject) => failedQueue.push({ resolve, reject });

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

// ── Redirección al login según contexto ──────────────────────────────────────
const redirectToLogin = () => {
  const routes = {
    member: '/member/login',
    social: '/social/login',
    company: '/auth/login',
    central: '/central/login'
  };
  window.location.replace(routes[detectContext()] ?? '/central/login');
};

// ── Detectar si el 403 es por empresa bloqueada o por cuenta de usuario ───────
const isCompanyBlocked = (response) => {
  // Prioridad 1: código explícito del backend (lo más robusto)
  const code = response?.data?.code;
  if (code === 'COMPANY_DISABLED' || code === 'PLAN_INACTIVE') return true;

  // Fallback: detectar por mensaje si el backend no envía código
  const message = (response?.data?.message ?? '').toLowerCase();
  return (
    message.includes('empresa') ||
    message.includes('inhabilitada') ||
    message.includes('no disponible') ||
    message.includes('plan inactivo')
  );
};

// ── Handlers por status code ──────────────────────────────────────────────────

/**
 * 402 — Empresa sin plan activo
 */
const handlePaymentRequired = () => {
  if (getSubdomain()) {
    window.location.replace('/tenant-expired');
    return true; // manejado
  }
  return false;
};

/**
 * 403 — Puede ser empresa bloqueada, plan expirado o cuenta de usuario inactiva
 */
const handleForbidden = async (error) => {
  if (!getSubdomain()) return false;

  // Rutas de login/otp: dejar pasar siempre — el form debe mostrar el error
  const url = error.config?.url ?? '';
  if (url.includes('/auth/login') || url.includes('/auth/verify-otp')) {
    return false;
  }

  const errorType = error.response?.data?.error_type;
  const msg = error.response?.data?.message ?? 'Servicio no disponible';

  // Plan expirado - cerrar sesión y redirigir a login con mensaje
  if (errorType === 'plan_expired') {
    const tokenStore = useTokenStore();
    tokenStore.clear();
    tokenStore.setRefresh(null);
    
    // Redirigir a login con mensaje de plan expirado
    const loginUrl = `/auth/login?error=plan_expired&message=${encodeURIComponent(msg)}`;
    window.location.replace(loginUrl);
    return true; // manejado — redirigido
  }

  // Empresa bloqueada - cerrar sesión y redirigir
  if (isCompanyBlocked(error.response) || errorType === 'tenant_blocked') {
    const tokenStore = useTokenStore();
    tokenStore.clear();
    tokenStore.setRefresh(null);
    
    const loginUrl = `/auth/login?error=tenant_blocked&message=${encodeURIComponent(msg)}`;
    window.location.replace(loginUrl);
    return true; // manejado — redirigido
  }

  // Cuenta de usuario inactiva u otro 403 → dejar que el store/view lo maneje
  return false;
};

/**
 * 401 — Token expirado: intentar refresh (solo para contexto company/central)
 */
const handleUnauthorized = async (error, client) => {
  const originalRequest = error.config;
  const url = originalRequest?.url ?? '';
  // No reintentar en rutas de auth para evitar bucles
  if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  // Si ya se reintentó, limpiar y redirigir
  if (originalRequest._retry) {
    useTokenStore().clear();
    redirectToLogin();
    return Promise.reject(error);
  }

  // Encolar si ya hay un refresh en curso
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      enqueueRequest(resolve, reject);
    }).then((token) => {
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
      return client(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const tokenStore = useTokenStore();
  const refreshToken = tokenStore.getRefresh();

  if (!refreshToken) {
    processQueue(error, null);
    isRefreshing = false;
    tokenStore.clear();
    redirectToLogin();
    return Promise.reject(error);
  }

  try {
    const { build, buildTenant } = await import('@config/api/core/core');
    const context = detectContext();
    const refreshUrl = context === 'company' 
      ? buildTenant(`company/auth/refresh`) 
      : build(context, 'auth/refresh');

    const { data: axiosData } = await axios.post(refreshUrl, {
      refresh_token: refreshToken
    });

    const payload = axiosData.data ?? axiosData;

    tokenStore.set(payload.access_token);
    tokenStore.setRefresh(payload.refresh_token);

    originalRequest.headers['Authorization'] = `Bearer ${payload.access_token}`;
    processQueue(null, payload.access_token);
    isRefreshing = false;

    return client(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    isRefreshing = false;
    tokenStore.clear();
    tokenStore.setRefresh(null);
    redirectToLogin();
    return Promise.reject(refreshError);
  }
};

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setupAuthInterceptor(client) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;

      if (status === 402) {
        handlePaymentRequired();
        return Promise.reject(error);
      }

      if (status === 403) {
        handleForbidden(error);
        return Promise.reject(error);
      }

      if (status === 401) {
        return handleUnauthorized(error, client);
      }

      return Promise.reject(error);
    }
  );
}
