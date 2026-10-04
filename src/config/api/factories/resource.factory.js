import { clean } from '@api/core/clean';

/**
 * Factory estándar para recursos REST
 * @param {string} baseUrl
 * @returns {Promise}
 */
export const resource = (baseUrl, overrides = {}) => {
  const base = clean(baseUrl);

  const defaults = {
    base,

    index: base,
    create: base,

    show: (id) => `${base}/${id}`,
    find: (id) => `${base}/${id}`,
    update: (id) => `${base}/${id}`,
    delete: (id) => `${base}/${id}`,
    deleteAll: () => base
  };

  return {
    ...defaults,
    ...overrides
  };
};
