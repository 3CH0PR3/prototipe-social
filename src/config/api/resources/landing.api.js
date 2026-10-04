import { build } from '../core/core';

const r = (path = '') => build('landing', path);

export const landingApi = {
  plans: r('plans'),
  teams: r('teams'),
  clips: r('clip-info'),
  faq: r('faq'),
  help: r('help'),
  reports: r('report'),
  letter: r('news-letter'),
  contact: r('contact'),

  companies: {
    base: r('companies'),
    find: r('companies/by-nit'),
    search: r('companies/search')
  },

  video: {
    hero: r('clip-info')
  },

  legal: {
    privacy: r('legal/privacy-policy'),
    terms: r('legal/terms-and-conditions'),
    termsOfUse: r('legal/terms-of-use'),
    cookies: r('legal/cookies-policy'),
    gdpr: r('legal/gdpr'),
    habeasData: r('legal/habeas-data'),
    disclaimer: r('legal/disclaimer'),
    changelog: r('legal/changelog'),
    dataProtection: r('legal/data-protection')
  }
};
