/**
 * Store compartido del tenant activo.
 * Se popula desde el domain.guard.js al hacer el ping.
 * Disponible para cualquier componente (aside, navbar, etc.)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getSubdomain } from '@shared/helpers/subdomain';

export const useTenantStore = defineStore('tenant', () => {
  const id = ref(null);
  const subdomain = ref(getSubdomain() ?? '');
  const statusCode = ref(null);
  const hasActivePlan = ref(null);

  // Nombre capitalizado del subdomain como fallback
  const displayName = computed(() => {
    if (!subdomain.value) return 'Mi empresa';
    return subdomain.value.charAt(0).toUpperCase() + subdomain.value.slice(1).toLowerCase();
  });

  const isActive = computed(() => statusCode.value === 1);

  const setFromPing = (data) => {
    id.value = data?.id ?? null;
    subdomain.value = data?.subdomain ?? getSubdomain() ?? '';
    statusCode.value = data?.status_code ?? null;
    hasActivePlan.value = data?.has_active_plan ?? null;
  };

  const clear = () => {
    id.value = null;
    statusCode.value = null;
    hasActivePlan.value = null;
  };

  return {
    id,
    subdomain,
    statusCode,
    hasActivePlan,
    displayName,
    isActive,
    setFromPing,
    clear
  };
});
