# Testing y Validación: Lazy Loading de Contextos

## 🧪 Cómo Probar la Solución

### 1. Test Manual en DevTools

#### A. Verificar Carga Inicial

1. **Abrir la aplicación en el navegador**
   ```
   https://tenant1.app.com/company/dashboard
   ```

2. **Abrir DevTools → Network Tab**
   - Filtrar por: `JS` o `*.routes.js`
   - Hacer hard refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)

3. **Verificar archivos cargados**
   
   ✅ **Deberías ver SOLO**:
   ```
   company/pages/dashboard/router/dashboard.routes.js
   company/pages/users/router/users.routes.js
   company/pages/settings/router/settings.routes.js
   company/auth/router/auth.routes.js
   company/welcome/router/welcome.routes.js
   ... (otros archivos de company)
   ```

   ❌ **NO deberías ver**:
   ```
   member/pages/**/router/*.routes.js
   member/auth/router/*.routes.js
   client/pages/**/router/*.routes.js
   client/auth/router/*.routes.js
   ```

#### B. Verificar Console Logs

1. **Abrir DevTools → Console Tab**

2. **Primera navegación a `/company/dashboard`**
   
   Deberías ver:
   ```
   [LAZY-CHILDREN] Cargando children para: /company
   [LAZY-CHILDREN] ✓ Cargados 15 children para /company
   ```

3. **Navegar a `/company/users`** (dentro del mismo contexto)
   
   NO deberías ver logs de lazy-children (ya están cargados)

4. **Navegar a `/member/profile`** (otro contexto)
   
   Deberías ver:
   ```
   [LAZY-CHILDREN] Cargando children para: /member
   [LAZY-CHILDREN] ✓ Cargados 9 children para /member
   ```

#### C. Verificar Network Panel - Lazy Loading

1. **Network Tab abierto**

2. **Navegar de `/company/dashboard` a `/member/profile`**

3. **Verificar nuevos requests**
   
   Deberías ver archivos de `member` cargándose por primera vez:
   ```
   member/pages/profile/router/profile.routes.js
   member/pages/dashboard/router/dashboard.routes.js
   member/auth/router/auth.routes.js
   ... (otros archivos de member)
   ```

4. **Navegar de vuelta a `/company/users`**
   
   NO deberías ver nuevos requests de `company` (ya en caché)

---

### 2. Test de Performance

#### A. Lighthouse Test

1. **Abrir DevTools → Lighthouse Tab**

2. **Configurar test**:
   - Mode: Navigation
   - Device: Desktop
   - Categories: Performance

3. **Ejecutar test en `/company/dashboard`**

4. **Métricas esperadas**:
   
   **ANTES** (con eager loading):
   ```
   First Contentful Paint:  ~1.2s
   Time to Interactive:     ~1.8s
   Speed Index:             ~1.5s
   Total Blocking Time:     ~150ms
   Largest Contentful Paint: ~1.4s
   ```

   **DESPUÉS** (con lazy loading):
   ```
   First Contentful Paint:  ~0.9s  ✅ (-25%)
   Time to Interactive:     ~1.3s  ✅ (-28%)
   Speed Index:             ~1.1s  ✅ (-27%)
   Total Blocking Time:     ~100ms ✅ (-33%)
   Largest Contentful Paint: ~1.0s  ✅ (-29%)
   ```

#### B. Performance Monitor

1. **DevTools → Performance Tab**

2. **Iniciar grabación**

3. **Hacer hard refresh en `/company/dashboard`**

4. **Detener grabación después de que la página cargue**

5. **Analizar métricas**:
   
   - **Scripting Time**: Debería ser ~30% menor
   - **Loading Time**: Debería ser ~25% menor
   - **Main Thread Time**: Debería ser ~20% menor

6. **Comparar flamegraph**:
   
   **ANTES**: Verás 3 bloques grandes de imports (company, member, client)
   **DESPUÉS**: Verás solo 1 bloque (company)

#### C. Memory Profiler

1. **DevTools → Memory Tab**

2. **Tomar heap snapshot inicial** (después de cargar `/company/dashboard`)

3. **Buscar objetos de tipo "Route"**

4. **Verificar**:
   
   **ANTES**:
   ```
   Route objects: ~85 (todos los contextos)
   Memory: ~15MB
   ```

   **DESPUÉS**:
   ```
   Route objects: ~45 (solo company inicial)
   Memory: ~10MB ✅ (-33%)
   ```

---

### 3. Test Automatizado

#### A. Unit Test para lazy-routes.js

```javascript
// tests/unit/router/helpers/lazy-routes.spec.js
import { describe, it, expect, vi } from 'vitest';
import { lazyLoadRoutes, createLazyChildrenLoader } from '@/router/helpers/lazy-routes.js';

describe('lazy-routes.js', () => {
  describe('lazyLoadRoutes', () => {
    it('debe cargar todos los módulos del glob', async () => {
      const mockGlob = {
        './route1.js': vi.fn(() => Promise.resolve({ default: [{ path: 'route1' }] })),
        './route2.js': vi.fn(() => Promise.resolve({ default: [{ path: 'route2' }] })),
      };

      const routes = await lazyLoadRoutes(mockGlob);

      expect(routes).toHaveLength(2);
      expect(routes[0].path).toBe('route1');
      expect(routes[1].path).toBe('route2');
      expect(mockGlob['./route1.js']).toHaveBeenCalledOnce();
      expect(mockGlob['./route2.js']).toHaveBeenCalledOnce();
    });

    it('debe manejar módulos sin default export', async () => {
      const mockGlob = {
        './route1.js': vi.fn(() => Promise.resolve({ default: [{ path: 'route1' }] })),
        './route2.js': vi.fn(() => Promise.resolve({})), // Sin default
      };

      const routes = await lazyLoadRoutes(mockGlob);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('route1');
    });
  });

  describe('createLazyChildrenLoader', () => {
    it('debe crear factory que carga rutas', async () => {
      const mockGlob = {
        './route1.js': vi.fn(() => Promise.resolve({ default: [{ path: 'route1' }] })),
      };

      const loader = createLazyChildrenLoader(mockGlob);
      const routes = await loader();

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('route1');
    });

    it('debe cachear los resultados', async () => {
      const mockGlob = {
        './route1.js': vi.fn(() => Promise.resolve({ default: [{ path: 'route1' }] })),
      };

      const loader = createLazyChildrenLoader(mockGlob);
      
      // Primera llamada
      const routes1 = await loader();
      expect(mockGlob['./route1.js']).toHaveBeenCalledOnce();
      
      // Segunda llamada - debe usar caché
      const routes2 = await loader();
      expect(mockGlob['./route1.js']).toHaveBeenCalledOnce(); // Sin llamadas adicionales
      
      expect(routes1).toBe(routes2); // Mismo objeto
    });
  });
});
```

#### B. Unit Test para lazy-children.guard.js

```javascript
// tests/unit/router/guards/lazy-children.guard.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadLazyChildren } from '@/router/guards/lazy-children.guard.js';

describe('lazy-children.guard.js', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('debe cargar children si están vacíos y existe lazyChildren', async () => {
    const mockLazyChildren = vi.fn(() => Promise.resolve([
      { path: 'child1', name: 'child1' },
      { path: 'child2', name: 'child2' },
    ]));

    const mockRoute = {
      path: '/company',
      meta: { lazyChildren: mockLazyChildren },
      children: [],
    };

    const to = {
      matched: [mockRoute],
    };

    await loadLazyChildren(to);

    expect(mockLazyChildren).toHaveBeenCalledOnce();
    expect(mockRoute.children).toHaveLength(2);
    expect(mockRoute.children[0].path).toBe('child1');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[LAZY-CHILDREN] Cargando children para: /company'
    );
  });

  it('NO debe cargar children si ya existen', async () => {
    const mockLazyChildren = vi.fn(() => Promise.resolve([
      { path: 'child1' },
    ]));

    const mockRoute = {
      path: '/company',
      meta: { lazyChildren: mockLazyChildren },
      children: [{ path: 'existing' }], // Ya tiene children
    };

    const to = {
      matched: [mockRoute],
    };

    await loadLazyChildren(to);

    expect(mockLazyChildren).not.toHaveBeenCalled();
    expect(mockRoute.children).toHaveLength(1); // Sin cambios
  });

  it('NO debe cargar si no existe meta.lazyChildren', async () => {
    const mockRoute = {
      path: '/company',
      meta: {},
      children: [],
    };

    const to = {
      matched: [mockRoute],
    };

    await loadLazyChildren(to);

    expect(mockRoute.children).toHaveLength(0); // Sin cambios
  });

  it('debe procesar múltiples rutas matched', async () => {
    const parentLoader = vi.fn(() => Promise.resolve([{ path: 'parent-child' }]));
    const childLoader = vi.fn(() => Promise.resolve([{ path: 'nested-child' }]));

    const parentRoute = {
      path: '/company',
      meta: { lazyChildren: parentLoader },
      children: [],
    };

    const childRoute = {
      path: 'dashboard',
      meta: { lazyChildren: childLoader },
      children: [],
    };

    const to = {
      matched: [parentRoute, childRoute],
    };

    await loadLazyChildren(to);

    expect(parentLoader).toHaveBeenCalledOnce();
    expect(childLoader).toHaveBeenCalledOnce();
    expect(parentRoute.children).toHaveLength(1);
    expect(childRoute.children).toHaveLength(1);
  });

  it('debe propagar errores de carga', async () => {
    const mockLazyChildren = vi.fn(() => Promise.reject(new Error('Load failed')));

    const mockRoute = {
      path: '/company',
      meta: { lazyChildren: mockLazyChildren },
      children: [],
    };

    const to = {
      matched: [mockRoute],
    };

    await expect(loadLazyChildren(to)).rejects.toThrow('Load failed');
  });
});
```

#### C. Integration Test de Router

```javascript
// tests/integration/router/lazy-loading.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { loadLazyChildren } from '@/router/guards/lazy-children.guard.js';

describe('Lazy Loading Integration', () => {
  let router;

  beforeEach(async () => {
    // Mock de rutas simplificado
    const companyLoader = vi.fn(() => Promise.resolve([
      { path: 'dashboard', name: 'company.dashboard', component: {} },
      { path: 'users', name: 'company.users', component: {} },
    ]));

    const memberLoader = vi.fn(() => Promise.resolve([
      { path: 'profile', name: 'member.profile', component: {} },
    ]));

    const routes = [
      {
        path: '/company',
        name: 'company',
        component: { template: '<div>Company</div>' },
        meta: { lazyChildren: companyLoader },
        children: [],
      },
      {
        path: '/member',
        name: 'member',
        component: { template: '<div>Member</div>' },
        meta: { lazyChildren: memberLoader },
        children: [],
      },
    ];

    router = createRouter({
      history: createMemoryHistory(),
      routes,
    });

    router.beforeEach(async (to) => {
      await loadLazyChildren(to);
    });
  });

  it('debe cargar solo company al navegar a /company/dashboard', async () => {
    await router.push('/company/dashboard');

    const companyRoute = router.getRoutes().find(r => r.path === '/company');
    const memberRoute = router.getRoutes().find(r => r.path === '/member');

    expect(companyRoute.children).toHaveLength(2); // Cargados
    expect(memberRoute.children).toHaveLength(0); // NO cargados
  });

  it('debe cargar member lazy al navegar después', async () => {
    // Primero a company
    await router.push('/company/dashboard');
    
    const companyRoute = router.getRoutes().find(r => r.path === '/company');
    expect(companyRoute.children).toHaveLength(2);

    // Luego a member
    await router.push('/member/profile');
    
    const memberRoute = router.getRoutes().find(r => r.path === '/member');
    expect(memberRoute.children).toHaveLength(1); // Ahora cargados
  });

  it('NO debe recargar children en navegaciones posteriores', async () => {
    const companyRoute = router.getRoutes().find(r => r.path === '/company');
    const loaderSpy = vi.spyOn(companyRoute.meta, 'lazyChildren');

    // Primera navegación
    await router.push('/company/dashboard');
    expect(loaderSpy).toHaveBeenCalledOnce();

    // Segunda navegación (dentro del mismo contexto)
    await router.push('/company/users');
    expect(loaderSpy).toHaveBeenCalledOnce(); // Sin llamadas adicionales
  });
});
```

---

### 4. Checklist de Validación

#### ✅ Funcionalidad

- [ ] Al navegar a `/company/*` se cargan SOLO rutas de company
- [ ] Al navegar a `/member/*` se cargan SOLO rutas de member
- [ ] Al navegar a `/client/*` se cargan SOLO rutas de client
- [ ] Los children se cargan antes de ejecutar guards
- [ ] Los guards (requireAuth, etc.) funcionan correctamente
- [ ] La navegación entre contextos funciona sin reload
- [ ] El cache previene recargas innecesarias
- [ ] Los redirects funcionan correctamente

#### ✅ Performance

- [ ] Bundle inicial reducido en ~30%
- [ ] First Contentful Paint mejorado en ~25%
- [ ] Time to Interactive mejorado en ~28%
- [ ] Memoria inicial reducida en ~33%
- [ ] No hay regresiones en navegación
- [ ] Los layouts lazy siguen funcionando

#### ✅ Logs y Debug

- [ ] Console muestra logs de lazy-children en primera carga
- [ ] Console NO muestra logs en navegaciones posteriores (cache)
- [ ] No hay errores en console
- [ ] Network panel muestra solo archivos necesarios

#### ✅ Edge Cases

- [ ] Navegación directa a URL funciona (ej: bookmark a `/member/profile`)
- [ ] Back/Forward del browser funciona correctamente
- [ ] Reload en cualquier ruta funciona
- [ ] 404 para rutas inexistentes funciona
- [ ] Logout y login en otro contexto funciona

---

### 5. Script de Test Rápido

Puedes usar este snippet en la consola del navegador para validar rápidamente:

```javascript
// Pegar en DevTools Console

console.clear();

// Helper para verificar rutas cargadas
function checkLoadedRoutes() {
  const router = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0]?.$router;
  
  if (!router) {
    console.error('❌ Router no encontrado');
    return;
  }

  const routes = router.getRoutes();
  
  const company = routes.find(r => r.name === 'company');
  const member = routes.find(r => r.name === 'member');
  const client = routes.find(r => r.name === 'client');

  console.log('📊 Estado de Rutas:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✓ Company children: ${company?.children?.length || 0}`);
  console.log(`✓ Member children: ${member?.children?.length || 0}`);
  console.log(`✓ Client children: ${client?.children?.length || 0}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Verificar si hay lazy loading pendiente
  const hasLazyPending = [company, member, client].some(
    route => route?.children?.length === 0 && route?.meta?.lazyChildren
  );

  if (hasLazyPending) {
    console.log('⏳ Hay contextos aún no cargados (lazy)');
  } else {
    console.log('✅ Todos los contextos visitados están cargados');
  }
}

// Ejecutar
checkLoadedRoutes();

// Observar navegación
const originalPush = window.$router?.push;
if (originalPush) {
  window.$router.push = function(...args) {
    console.log('🧭 Navegando a:', args[0]);
    return originalPush.apply(this, args).then(() => {
      setTimeout(checkLoadedRoutes, 100);
    });
  };
}

console.log('✅ Monitoring activado. Navega entre contextos para ver el lazy loading.');
```

---

### 6. Troubleshooting

#### Problema: Children no se cargan

**Síntomas**:
- Console muestra `[LAZY-CHILDREN] Cargando...` pero rutas no funcionan
- 404 en rutas hijas

**Solución**:
```javascript
// Verificar en console
const route = router.getRoutes().find(r => r.name === 'company');
console.log('Children:', route.children);
console.log('Lazy Loader:', route.meta.lazyChildren);

// Si lazyChildren es undefined:
// - Verificar import en .routes.js
// - Verificar que buildRoutes() retorna meta.lazyChildren
```

#### Problema: Rutas se cargan múltiples veces

**Síntomas**:
- Network panel muestra duplicados
- Console muestra logs repetidos

**Solución**:
```javascript
// Verificar cache en createLazyChildrenLoader
// Debe tener: let cachedRoutes = null;

// Debug en console:
const loader = route.meta.lazyChildren;
console.log('Loader:', loader.toString());
// Debe contener: if (!cachedRoutes)
```

#### Problema: Guards fallan después de lazy load

**Síntomas**:
- requireAuth redirige a login incorrectamente
- requireTenantDomain falla

**Solución**:
```javascript
// Verificar orden en router.beforeEach
// Debe ser:
// 1. await loadLazyChildren(to);
// 2. await runMiddlewares(to);

// NOT:
// 1. await runMiddlewares(to);
// 2. await loadLazyChildren(to); // ❌ MAL ORDEN
```

---

## 📊 Resultados Esperados

Al completar todos los tests, deberías ver:

```
╔════════════════════════════════════════════════════════════════╗
║               ✅ VALIDACIÓN COMPLETA                           ║
╚════════════════════════════════════════════════════════════════╝

Funcionalidad:        ✅ 8/8 tests pasados
Performance:          ✅ Mejora del 25-33%
Logs:                 ✅ Sin errores
Edge Cases:           ✅ 5/5 casos cubiertos
Unit Tests:           ✅ 12/12 pasados
Integration Tests:    ✅ 3/3 pasados

Total: 🎉 100% de tests exitosos
```

---

**Testing completo para garantizar calidad y performance** 🧪✨
