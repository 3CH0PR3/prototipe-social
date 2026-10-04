// Suprimir errores de scripts inyectados por Brave/extensiones
window.addEventListener('error', (e) => {
  if (e.message?.includes('startTime') || e.message?.includes('reportAllChanges')) {
    e.preventDefault();
    return false;
  }
});

import './assets/app.css';
import App from './App.vue';
import { createAppRouter } from './router/index.js';
import { createApplication } from './bootstrap/createApplication';

// Resolver rutas lazy en paralelo, luego montar la app
const router = await createAppRouter();
const app = await createApplication(App, router);
app.mount('#app');
