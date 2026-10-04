import { API, Http } from '@shared/http/Http';

export const MembersService = {
  /**
   * Obtener todos los datos de miembros con estadísticas
   * @returns {Promise}
   */
  async fetchData(params = {}) {
    return Http.get(API.company.resolutions.members.base, params);
  },

  /**
   * Obtener un miembro específico por ID
   * @param {number} id
   * @returns {Promise}
   */
  async fetchById(id) {
    return Http.get(API.company.resolutions.members.show(id));
  },

  /**
   * Crear un nuevo miembro
   * @param {Object} data
   * @returns {Promise}
   */
  async create(data) {
    return Http.post(API.company.resolutions.members.create, data);
  },

  /**
   * Actualizar un miembro existente
   * @param {number} id
   * @param {Object} data
   * @returns {Promise}
   */
  async update(id, data) {
    return Http.put(API.company.resolutions.members.update(id), data);
  },

  /**
   * Eliminar (mover a papelera) un miembro
   * @param {number} id
   * @param {string} password
   * @returns {Promise}
   */
  async delete(id, password) {
    return Http.delete(API.company.resolutions.members.delete(id), {
      data: { password }
    });
  },

  /**
   * Restaurar un miembro desde la papelera
   * @param {number} id
   * @returns {Promise}
   */
  async restore(id) {
    return Http.post(API.company.resolutions.members.restore(id));
  },

  /**
   * Actualizar el estado de un miembro
   * @param {number} id
   * @param {string} status_code
   * @returns {Promise}
   */
  async updateStatus(id, status_code) {
    return Http.patch(API.company.resolutions.members.updateStatus(id), {
      status_code
    });
  },

  /**
   * Eliminar permanentemente todos los miembros en papelera
   * @param {string} password
   * @returns {Promise}
   */
  async forceDeleteAll(password) {
    return Http.delete(API.company.resolutions.members.forceDeleteAll, {
      data: { password }
    });
  },

  /**
   * Obtener lista simplificada de miembros para selects/lookups
   * @returns {Promise}
   */
  async lookup() {
    return Http.get(API.company.resolutions.members.lookup);
  },

  /**
   * Obtener datos de miembros para exportar (sin paginación)
   * @param {Object} params
   * @returns {Promise}
   */
  async export(params = {}) {
    return Http.get(API.company.resolutions.members.export, params);
  },

  /**
   * Buscar miembros con filtros
   * @param {Object} filters
   * @returns {Promise}
   */
  async search(filters = {}) {
    return Http.get(API.company.resolutions.members.base, filters);
  }
};
