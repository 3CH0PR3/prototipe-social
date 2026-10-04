import { API, Http } from '@shared/http/Http';

export const VehiclesService = {
  /**
   * Obtener todos los datos de vehículos con estadísticas
   * @returns {Promise}
   */
  async fetchData() {
    return Http.get('company/vehicle-management');
  },

  /**
   * Obtener un vehículo específico por ID
   * @param {number} id
   * @returns {Promise}
   */
  async fetchById(id) {
    return Http.get(`company/vehicle-management/${id}`);
  },

  /**
   * Crear un nuevo vehículo
   * @param {Object} data
   * @returns {Promise}
   */
  async create(data) {
    return Http.post('company/vehicle-management', data);
  },

  /**
   * Actualizar un vehículo existente
   * @param {number} id
   * @param {Object} data
   * @returns {Promise}
   */
  async update(id, data) {
    return Http.put(`company/vehicle-management/${id}`, data);
  },

  /**
   * Eliminar un vehículo
   * @param {number} id
   * @returns {Promise}
   */
  async delete(id) {
    return Http.delete(`company/vehicle-management/${id}`);
  },

  /**
   * Obtener tipos de vehículos
   * @returns {Promise}
   */
  async getVehicleTypes() {
    return Http.get('company/vehicle-management/types');
  },

  /**
   * Obtener estadísticas de vehículos
   * @returns {Promise}
   */
  async getStatistics() {
    return Http.get('company/vehicle-management/statistics');
  },

  /**
   * Obtener historial de mantenimiento
   * @param {number} vehicleId
   * @returns {Promise}
   */
  async getMaintenanceHistory(vehicleId) {
    return Http.get(`company/vehicle-management/${vehicleId}/maintenance`);
  },

  /**
   * Buscar vehículos
   * @param {Object} filters
   * @returns {Promise}
   */
  async search(filters = {}) {
    return Http.get('company/vehicle-management/search', filters);
  }
};
