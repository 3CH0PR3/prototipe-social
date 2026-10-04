import { resource } from '@api/factories/resource.factory';
import { build } from '../core/core';

const r = (path = '') => build('central', path);

export const centralApi = {
  roles: r('roles'),

  auth: {
    me: r('auth/me'),
    login: r('auth/login'),
    logout: r('auth/logout'),

    verifyCode: r('auth/verify-code'),
    findAccount: r('auth/find-account'),
    verifyAccount: r('auth/verify-account'),

    password: {
      forgot: r('auth/forgot-password'),
      reset: r('auth/reset-password')
    },

    forget: r('auth/forge-session')
  },

  users: resource(r('users')),
  plans: resource(r('plans')),
  departments: r('departments'),

  profile: {
    me: r('profile'),
    avatar: r('profile/avatar')
  },

  companies: {
    base: r('companies'),
    create: r('companies'),
    find: (id) => r(`companies/${id}`),
    update: (id) => r(`companies/${id}`),
    delete: (id) => r(`companies/${id}`),

    show: (id) => r(`companies/${id}/show`),
    users: (id) => r(`companies/${id}/users`),
    activity: (id) => r(`companies/${id}/activity`)
  },

  notifications: {
    index: r('notifications'),
    fetchOne: (id) => r(`central/notifications/${id}`),
    markAsRead: (id) => r(`notifications/read/${id}`),
    markAllAsRead: r('notifications/read-all'),
    delete: (id) => r(`notifications/${id}`)
  },

  chats: r('chats'),

  statuses: r('statuses'),

  emails: {
    base: r('center-email-service'),
    show: (id) => r(`center-email-service/${id}`),
    reply: (id) => r(`center-email-service/${id}/reply`),
    delete: (id) => r(`center-email-service/${id}`),
    markRead: (id) => r(`center-email-service/${id}/mark-read`)
  },

  settings: {
    load: {
      csv: r('settings/load/csv')
    },
    billings: r('settings/billings')
  },

  dashboard: {
    activities: r('dashboard/activities')
  },

  system: {
    notifications: r('system/notifications'),
    activities: r('system/activities'),
    logs: {
      index: r('system/logs'),
      clear: r('system/logs/clear'),
      show: (id) => r(`system/logs/${id}`),
      delete: (id) => r(`system/logs/${id}`)
    }
  },

  blockchain: {
    products: r('blockchain/products'),
    product: (id) => r(`blockchain/products/${id}`),

    rawMaterials: r('blockchain/raw-materials'),
    rawMaterial: (id) => r(`blockchain/raw-materials/${id}`),

    investors: r('blockchain/investors'),
    investor: (id) => r(`blockchain/investors/${id}`),

    investorPayment: (id) => r(`blockchain/investors/${id}/payment`),
    productInvestors: (id) => r(`blockchain/products/${id}/investors`)
  },

  tickets: {
    base: r('tickets'),
    show: (uuid) => r(`tickets/${uuid}`),
    update: (uuid) => r(`tickets/${uuid}`),
    addMessage: (uuid) => r(`tickets/${uuid}/messages`)
  }
};
