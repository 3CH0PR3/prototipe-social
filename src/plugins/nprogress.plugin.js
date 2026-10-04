import NProgress from 'nprogress';

/**
 * Configura NProgress para indicador de carga en navegación
 */
export function configureNProgress() {
  NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1,
    template: `
      <div class="bar bg-primary" role="bar">
        <div class="peg"></div>
      </div>
    `
  });
}

export default {
  install() {
    configureNProgress();
  }
};
