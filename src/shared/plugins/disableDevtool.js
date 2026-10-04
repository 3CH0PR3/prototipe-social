export const DisableDevtoolPlugin = {
  install() {
    if (import.meta.env.VITE_APP_ENV !== 'production') return;

    // import('disable-devtool').then(module => {
    //   module.default({
    //     interval: 100,
    //     detectors: 'all',
    //     disableMenu: true,
    //     rewriteHTML: true,
    //     url: 'about:blank',
    //     disableLocalStorage: true,
    //     disableContextMenu: true,
    //   });
    // });

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0]?.includes?.('🍍') || args.some((a) => a?.includes?.('store installed'))) return;

      originalConsoleLog.apply(console, args);
    };
  }
};
