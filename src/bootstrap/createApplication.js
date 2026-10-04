import { createApp } from 'vue';
import i18n from '@shared/plugins/i18n/i18n';
import { loadLanguageAsync } from '@shared/plugins/i18n/i18n';
import {
  PiniaPlugin,
  HeadPlugin,
  NProgressPlugin,
  ServiceWorkerPlugin,
  FontAwesomePlugin,
  DayjsPlugin,
  DisableDevtoolPlugin,
  PerfectScrollbarPlugin
} from '@/plugins';

/**
 * Crea y configura una instancia de Vue con todos los plugins
 * Reutilizable para diferentes contextos (central, company, etc.)
 *
 * @param {Object} rootComponent - Componente raíz de Vue
 * @param {Object} router - Instancia de Vue Router
 * @param {Object} options - Opciones adicionales
 * @param {Array} options.extraPlugins - Plugins adicionales específicos del contexto
 * @returns {Promise<App>} Instancia de Vue configurada
 */
export async function createApplication(rootComponent, router, options = {}) {
  const { extraPlugins = [] } = options;

  // Bloquear vueuse-color-scheme — VueUse lo recrea internamente, lo interceptamos
  localStorage.removeItem('vueuse-color-scheme');
  const _setItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => {
    if (key === 'vueuse-color-scheme') return;
    _setItem(key, value);
  };

  // Cargar idioma antes de crear la app
  await loadLanguageAsync(i18n.global.locale.value);

  // Crear app
  const app = createApp(rootComponent);

  // Core plugins (orden importa)
  app.use(i18n);
  app.use(PiniaPlugin);
  app.use(router);
  app.use(HeadPlugin);
  app.use(NProgressPlugin);
  app.use(ServiceWorkerPlugin);
  app.use(DayjsPlugin);
  app.use(FontAwesomePlugin);
  app.use(DisableDevtoolPlugin);
  app.use(PerfectScrollbarPlugin);

  // Plugins adicionales del contexto
  extraPlugins.forEach((plugin) => app.use(plugin));

  return app;
}
