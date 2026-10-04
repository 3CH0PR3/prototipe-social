import { registerSW } from 'virtual:pwa-register';

/**
 * Registra el Service Worker oficial para GEA Social.
 * Manejo nativo y limpio: sin inyecciones artificiales ni sobreescrituras en ventana.
 */
export function registerAppServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.info('[PWA] Nueva versión disponible en GEA Social.');
      },
      onOfflineReady() {
        console.info('[PWA] GEA Social lista para funcionar sin conexión.');
      },
      onRegistered(r) {
        console.info('[PWA] Service Worker registrado en scope:', r?.scope);
      },
      onRegisterError(err) {
        console.warn('[PWA] Error registrando Service Worker:', err);
      }
    });
  }
}

export default {
  install() {
    registerAppServiceWorker();
  }
};
