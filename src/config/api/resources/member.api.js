import { buildTenant } from '../core/core';

const r = (path = '') => buildTenant(`member/${path}`).replace(/\/+$/, '');

export const memberApi = {
  auth: {
    me: r('auth/me'),
    login: r('auth/login'),
    logout: r('auth/logout'),

    findAccount: r('auth/find-account'),
    verifyCode: r('auth/verify-code'),
    forgeSession: r('auth/forge-session'),
    resetPassword: r('auth/reset-password')
  },

  me: r('me'),
  feed: r('feed'),
  posts: r('posts'),
  profiles: r('profiles')
};
