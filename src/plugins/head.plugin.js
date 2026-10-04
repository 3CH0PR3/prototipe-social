import { createHead } from '@vueuse/head';

/**
 * Plugin para manejo de meta tags y títulos de página
 */
export default {
  install(app) {
    const head = createHead();
    app.use(head);
  }
};
