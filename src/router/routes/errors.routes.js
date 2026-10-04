import { requireTenantDomain, requireTenantDomainOnly } from '@router/guards/domain.guard';

export default [
  {
    path: '/access-denied',
    name: 'forbidden',
    meta: { title: '403 - Acceso denegado' },
    component: () => import('@error/views/system/403/ForbiddenView.vue')
  },

  {
    path: '/server-error',
    name: 'server-error',
    meta: { title: '500 - Error interno del servidor' },
    component: () => import('@error/views/system/500/ServerErrorView.vue')
  },

  {
    path: '/page-not-found',
    name: 'not-found',
    meta: { title: '404 - Página no encontrada' },
    component: () => import('@error/views/system/404/NotFoundView.vue')
  },

  {
    path: '/tenant-not-found',
    name: 'tenant-not-found',
    meta: {
      title: 'Empresa no encontrada',
      middleware: requireTenantDomainOnly
    },
    component: () => import('@error/views/company/TenantNotFound.vue')
  },

  {
    path: '/tenant-inactive',
    name: 'tenant-inactive',
    meta: { title: 'Empresa inactiva', middleware: requireTenantDomain },
    component: () => import('@error/views/company/TenantInactive.vue')
  },

  {
    path: '/tenant-no-database',
    name: 'tenant-no-database',
    meta: {
      title: 'Base de datos no configurada',
      middleware: requireTenantDomainOnly
    },
    component: () => import('@error/views/company/TenantNoDatabase.vue')
  },

  {
    path: '/tenant-expired',
    name: 'tenant-expired',
    meta: { title: 'Suscripción expirada', middleware: requireTenantDomain },
    component: () => import('@error/views/company/TenantExpired.vue')
  },

  {
    path: '/tenant-maintenance',
    name: 'tenant-maintenance',
    meta: {
      title: 'Empresa en mantenimiento',
      middleware: requireTenantDomain
    },
    component: () => import('@error/views/company/TenantMaintenance.vue')
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/page-not-found'
  }
];
