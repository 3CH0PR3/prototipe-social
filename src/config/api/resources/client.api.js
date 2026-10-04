import { buildTenant } from '../core/core';

const r = (path = '') => buildTenant(`client/${path}`).replace(/\/+$/, '');

export const clientApi = {
  auth: {
    me: r('auth/me'),
    login: r('auth/login'),
    register: r('auth/register'),
    logout: r('auth/logout'),

    findAccount: r('auth/find-account'),
    verifyCode: r('auth/verify-code'),
    forgeSession: r('auth/forge-session'),
    resetPassword: r('auth/reset-password')
  },

  me: r('me'),
  dashboard: r('dashboard')
};
