import { build } from '../core/core';

const r = (path = '') => build('social', path);

export const socialApi = {
  auth: {
    me: r('auth/me'),
    login: r('auth/login'),
    register: r('auth/register'),
    verifyOtp: r('auth/verify-otp'),
    resendOtp: r('auth/resend-otp'),

    password: {
      findAccount: r('auth/find-account'),
      resendCode: r('auth/resend-code'),
      verifyCode: r('auth/verify-code'),
      checkResetStatus: r('auth/check-reset-status'),
      reset: r('auth/reset-password'),
      forget: r('auth/forge-session')
    },

    logout: r('auth/logout')
  },

  feed: {
    global: r('feed'),
    personal: r('feed/personal')
  },

  profiles: {
    base: r('profiles'),
    search: r('profiles/search')
  },

  posts: r('posts'),
  friendships: r('friendships'),
  suggestions: r('suggestions'),
  explore: r('explore'),
  comments: r('comments'),
  likes: r('likes'),
  reports: r('reports'),
  follows: r('follows'),
  chats: r('chats'),
  messages: r('messages'),
  groups: {
    base: r('groups'),
    join: (id) => r(`groups/${id}/join`),
    leave: (id) => r(`groups/${id}/leave`)
  },
  groupMembers: r('group-members'),
  locations: {
    departments: r('departments'),
    municipalities: (departmentCode) => r(`departments/${departmentCode}/municipalities`)
  },
  companies: {
    search: r('companies/search'),
    apply: (tenantId) => r(`companies/${tenantId}/apply`)
  }
};
