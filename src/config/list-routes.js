import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const routesDir = resolve('./src/router/routes');
const featuresDir = resolve('./src/features');

// Función para extraer rutas de un archivo
function extractRoutes(filePath, context = '') {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, 'utf-8');
  const routes = [];

  // Extraer paths
  const pathMatches = [...content.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)];
  const nameMatches = [...content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g)];

  pathMatches.forEach(([, path], index) => {
    const name = nameMatches[index] ? nameMatches[index][1] : '';
    routes.push({ path, name, context });
  });

  return routes;
}

// Función para buscar archivos de rutas recursivamente
function findRouteFiles(dir, pattern = /\.routes\.js$/) {
  const files = [];

  if (!existsSync(dir)) return files;

  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...findRouteFiles(fullPath, pattern));
    } else if (pattern.test(item.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

console.log('\n📍 Rutas de la app:\n');

// 1. Rutas principales del router
console.log('  🔷 ROUTER PRINCIPAL (src/router/routes/)\n');
const mainFiles = readdirSync(routesDir).filter((f) => f.endsWith('.js'));

mainFiles.forEach((file) => {
  const routes = extractRoutes(`${routesDir}/${file}`);

  if (routes.length) {
    console.log(`    📁 ${file}`);
    routes.forEach(({ path, name }) => {
      const nameStr = name ? ` [${name}]` : '';
      console.log(`        → ${path}${nameStr}`);
    });
    console.log();
  }
});

// 2. Rutas de features (auth, welcome, etc)
console.log('  🔷 FEATURES AUTH ROUTES\n');

const contexts = ['central', 'company', 'social', 'member'];

contexts.forEach((context) => {
  const authRoutesPath = resolve(`./src/features/${context}/auth/router/auth.routes.js`);

  if (existsSync(authRoutesPath)) {
    const routes = extractRoutes(authRoutesPath, context);

    if (routes.length) {
      console.log(`    📁 ${context}/auth/router/auth.routes.js`);
      routes.forEach(({ path, name }) => {
        console.log(`        → ${path} [${name}]`);
      });
      console.log();
    }
  }
});

// 3. Otras rutas públicas de features
console.log('  🔷 FEATURES PUBLIC ROUTES\n');

const welcomeRoutesPath = resolve('./src/features/company/welcome/router/welcome.routes.js');
if (existsSync(welcomeRoutesPath)) {
  const routes = extractRoutes(welcomeRoutesPath, 'company');
  console.log(`    📁 company/welcome/router/welcome.routes.js`);
  routes.forEach(({ path, name }) => {
    console.log(`        → ${path} [${name}]`);
  });
  console.log();
}

// 4. Rutas protegidas de features (cargadas dinámicamente)
console.log('  🔷 FEATURES PROTECTED ROUTES (cargadas dinámicamente)\n');

contexts.forEach((context) => {
  const featureDir = resolve(`./src/features/${context}`);

  if (existsSync(featureDir)) {
    const routeFiles = findRouteFiles(featureDir).filter(
      (f) => !f.includes('/auth/router/') && !f.includes('/welcome/router/')
    );

    if (routeFiles.length) {
      console.log(`    📦 ${context.toUpperCase()}`);

      routeFiles.forEach((file) => {
        const relativePath = file.replace(featureDir, '').replace(/\\/g, '/');
        const routes = extractRoutes(file, context);

        if (routes.length) {
          console.log(`        📄 ${relativePath}`);
          routes.forEach(({ path, name }) => {
            console.log(`            → ${path} [${name}]`);
          });
        }
      });
      console.log();
    }
  }
});

console.log('  ✅ Listado completo de rutas\n');
