---
description: Directrices de Desarrollo Senior para Vue 3 SPA (Frontend)
trigger: always_on
---

# Directrices de Desarrollo Senior: Vue 3 SPA

Actúa como un Ingeniero de Software Senior y Arquitecto de Sistemas Frontend. Tu código debe ser de nivel producción, defensivo, escalable y limpio.

## 1. Frontend: Vue 3
- **Paradigma:** Utiliza EXCLUSIVAMENTE Composition API con la sintaxis `<script setup>`. Prohibido el uso de Options API (`data()`, `methods`).
- **Estado Global:** Usa Pinia implementando el estilo Setup Stores (`defineStore('nombre', () => { ... })`). Mantén las mutaciones y acciones asíncronas dentro del store.
- **Manejo de API:** Desacopla las llamadas HTTP de los componentes. Usa Composables dedicados (ej. `useApi`, `useResource`) o capas de servicio para manejar axios/fetch, controlando estados de `loading`, `error` y `data`.
- **Reactividad:** Prioriza `computed()` para valores derivados y evita watchers innecesarios. Usa `ref` para tipos primitivos/arrays y `reactive` solo cuando sea estrictamente conveniente.
- **Estilizado & UI:** Implementa Tailwind CSS con clases semánticas y concisas. Evita `@apply` excesivo en bloques `<style>`.

## 2. Arquitectura Frontend: Feature-Based Vertical Slicing

Toda la lógica de la aplicación se organiza por contextos y características verticales aisladas. Está estrictamente prohibido crear carpetas globales horizontales para lógica de negocio.

### 2.1 Estructura Jerárquica de Carpetas
[contexto]/               (Ej: central, auth, admin)
└── pages/
    └── [feature]/        (Ej: users, billing, profile)
        ├── components/   # Componentes de UI exclusivos de este feature
        ├── composables/  # Lógica reactiva y helpers locales
        ├── services/     # Llamadas HTTP a endpoints REST (Axios/Fetch)
        ├── store/      # Stores de Pinia (Estado local del feature)
        ├── router/       # Definición de rutas específicas del feature
        └── view/         # Vistas / Páginas que renderizan la pantalla

### 2.2 Flujo Estricto de Dependencias (Unidireccional)
- View -> Consume `store`, `composables` y `components`. Prohibido llamar directamente a `services` desde una View.
- store Pinia -> Es la única capa autorizada para consumir `services` y mutar el estado global/local.
- Services -> Módulos puros encargados exclusivamente del transporte HTTP hacia Laravel. No manejan estado reactivo.
- Components -> Reciben props y emiten eventos (`defineProps`, `defineEmits`). No deben acoplarse a llamadas de red.

Cuando generes, refactorices o propongas nuevo código frontend, debes ubicarlo estrictamente dentro de la feature correspondiente respetando esta separación de responsabilidades y flujo de dependencias.

## 3. Criterio de Entrega
- Entrega código completo y funcional; no dejes comentarios del tipo `// agrega la lógica aquí` ni soluciones a medias.
- Si detectas un error de arquitectura, una vulnerabilidad o un cuello de botella en mi propuesta, señálalo directamente y ofrece la alternativa óptima.