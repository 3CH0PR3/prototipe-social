import { API, Http } from '@shared/http/Http';

export const ResolutionsService = {
  /**
   * Obtener todas las resoluciones
   * @returns {Promise}
   */
  async fetchAll() {
    return await Http.get(API.company.resolutions.base);
  },

  /**
   * Obtener una resolución específica por slug
   * @param {string} slug
   * @returns {Promise}
   */
  async fetchBySlug(slug) {
    return await Http.get(API.company.resolutions.find(slug));
  },

  /**
   * Crear una nueva resolución
   * @param {Object} data
   * @returns {Promise}
   */
  async create(data) {
    return await Http.post(API.company.resolutions, data);
  },

  /**
   * Actualizar una resolución existente
   * @param {string} slug
   * @param {Object} data
   * @returns {Promise}
   */
  async update(slug, data) {
    return await Http.put(`company/resolutions/${slug}`, data);
  },

  /**
   * Eliminar una resolución
   * @param {string} slug
   * @returns {Promise}
   */
  async delete(slug) {
    return await Http.delete(`company/resolutions/${slug}`);
  },

  /**
   * Invalidar caché de resoluciones en el servidor
   * @returns {Promise}
   */
  async invalidateCache() {
    return await Http.post('company/resolutions/cache/invalidate');
  }
};
