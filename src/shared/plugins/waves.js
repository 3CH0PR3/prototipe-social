import Waves from 'node-waves';
import 'node-waves/dist/waves.min.css';

export default {
  install(app, options = {}) {
    const style = document.createElement('style');
    style.textContent = `
      [data-bs-theme="light"] .waves-ripple {
        // background: rgba(var(--bs-primary-rgb), 0.2) !important;
        background: rgba(216, 216, 216, 0.64) !important;
      }

      [data-bs-theme="dark"] .waves-ripple {
        background: rgba(255, 255, 255, 0.3) !important;
      }
    `;
    document.head.appendChild(style);

    const selector =
      options.selector ||
      `
    button:not(.btn-close):not(.dropdown-item):not(.layout-menu-toggle):not(.no-waves),
    .btn:not(.dropdown-item):not(.layout-menu-toggle):not(.no-waves),
    .button:not(.layout-menu-toggle):not(.no-waves)
  `;
    const classes = options.classes || ['waves-light'];

    const initWaves = () => {
      Waves.init();

      requestAnimationFrame(() => {
        Waves.attach(selector, classes);
      });
    };

    initWaves();

    // Reinicializar waves cuando se agregan nuevos elementos al DOM
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        Waves.attach(selector, classes);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    app.config.globalProperties.$waves = {
      refresh: initWaves
    };

    app.provide('waves', {
      refresh: initWaves
    });
  }
};
