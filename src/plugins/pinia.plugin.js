import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/**
 * Configura Pinia con persistencia en localStorage
 * Para recarga instantánea sin pantalla blanca
 */
export function createPiniaInstance() {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  return pinia;
}

export default {
  install(app) {
    const pinia = createPiniaInstance();
    app.use(pinia);
  }
};
