import { protocol, appDomain, apiDomain, prefix } from './urls';
import { getSubdomain } from '@shared/helpers/subdomain';

export const frontendUrl = `${protocol}://${appDomain}`;
export const apiUrl = `${protocol}://${apiDomain}`;

/**
 * URL para contextos globales (central, landing, member, social)
 * → https://be-gea-wrc.test/api/v1/{context}/{path}
 */
export const build = (context, path = '') => {
  return `${apiUrl}/${prefix}/${context}/${path}`.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');
};

/**
 * URL para contextos tenant (company, member) — usa el subdominio del tenant en runtime
 * → https://{subdomain}.be-gea-wrc.test/api/v1/{path}
 */
export const buildTenant = (path) => {
  const subdomain = getSubdomain();
  const host = subdomain ? `${subdomain}.${apiDomain}` : apiDomain;
  return `${protocol}://${host}/${prefix}/${path}`.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');
};

export const resource = (base) => {
  return (path = '') => `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');
};

export const scope = (context) => {
  return (path = '') => `/${prefix}/${context}/${path}`.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');
};
