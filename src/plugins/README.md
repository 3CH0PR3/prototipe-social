# Plugins Architecture

Sistema de plugins modular y reutilizable para diferentes contextos (Central, Company, etc.)

## Estructura

```
src/
├── plugins/
│   ├── index.js              # Registro de todos los plugins
│   ├── pinia.plugin.js       # Pinia con persistencia
│   ├── head.plugin.js        # Meta tags y títulos
│   ├── nprogress.plugin.js   # Indicador de carga
│   └── sw.plugin.js          # Service Worker
├── bootstrap/
│   ├── index.js              # Exports principales
│   └── createApplication.js  # Factory para crear apps
└── app.js                    # Entry point principal
```

## Uso básico (Central context)

```js
// src/app.js
import './assets/app.css';
import App from './App.vue';
import router from './router/index.js';
import { createApplication } from './bootstrap/createApplication';

const app = await createApplication(App, router);
app.mount('#app');
```

## Uso con plugins adicionales (Company context)

```js
// src/contexts/company/app.js
import './assets/app.css';
import App from './App.vue';
import router from './router/company.js';
import { createApplication } from '@/bootstrap/createApplication';
import CompanySpecificPlugin from './plugins/company.plugin.js';

const app = await createApplication(App, router, {
  extraPlugins: [CompanySpecificPlugin]
});

app.mount('#app');
```

## Plugins incluidos

### Core Plugins (siempre se registran)

- **PiniaPlugin** - Store con persistencia en localStorage
- **HeadPlugin** - Manejo de meta tags
- **NProgressPlugin** - Barra de progreso en navegación
- **ServiceWorkerPlugin** - Cache para recarga instantánea
- **FontAwesomePlugin** - Iconos
- **DayjsPlugin** - Fechas
- **DisableDevtoolPlugin** - Seguridad en producción
- **i18n** - Internacionalización

### Crear un plugin personalizado

```js
// src/contexts/company/plugins/company.plugin.js
export default {
  install(app, options) {
    // Tu lógica aquí
    app.config.globalProperties.$company = {
      // propiedades globales
    };

    // Provide/inject
    app.provide('companyConfig', options);
  }
};
```

## Ventajas

✅ **Código limpio** - app.js es simple y legible
✅ **Reutilizable** - Mismos plugins para central/company
✅ **Modular** - Cada plugin en su archivo
✅ **Extensible** - Fácil agregar plugins específicos por contexto
✅ **Mantenible** - Cambios centralizados
