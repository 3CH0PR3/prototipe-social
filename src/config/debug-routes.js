// Agregar esto temporalmente en main.js después de crear el router
// import router from './router'
// console.log('=== RUTAS REGISTRADAS ===')
// router.getRoutes().forEach(route => {
//   console.log(`${route.path} → ${route.name || '(sin nombre)'}`)
// })

export const debugRoutes = (router) => {
  console.log('\n=== RUTAS REGISTRADAS EN VUE ROUTER ===\n');

  const routes = router.getRoutes();

  // Agrupar por contexto
  const grouped = {
    central: [],
    company: [],
    social: [],
    member: [],
    landing: [],
    errors: [],
    other: []
  };

  routes.forEach((route) => {
    const name = route.name || '';
    const path = route.path;

    if (name.startsWith('central.')) grouped.central.push(route);
    else if (name.startsWith('company.')) grouped.company.push(route);
    else if (name.startsWith('social.')) grouped.social.push(route);
    else if (name.startsWith('member.')) grouped.member.push(route);
    else if (path === '/' || path.startsWith('/home')) grouped.landing.push(route);
    else if (path.startsWith('/40') || path.startsWith('/50') || path.includes('not-found'))
      grouped.errors.push(route);
    else grouped.other.push(route);
  });

  Object.entries(grouped).forEach(([context, routes]) => {
    if (routes.length === 0) return;

    console.log(`\n📦 ${context.toUpperCase()}:`);
    routes.forEach((route) => {
      console.log(`  ${route.path} → ${route.name || '(sin nombre)'}`);
    });
  });

  console.log('\n=== TOTAL:', routes.length, 'rutas ===\n');
};
