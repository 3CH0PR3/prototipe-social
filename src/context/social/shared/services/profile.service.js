import { API, Http } from '@shared/http/Http';

/**
 * Service unificado de perfiles
 * Consolida profile.service.js y profiles.service.js
 * Funciona para mi perfil y perfiles públicos
 */
export const ProfileService = {
  /**
   * Obtener perfil por ID o username
   * @param {string|number} idOrUsername - ID o username del perfil
   */
  getProfile: async (idOrUsername) => {
    return await Http.get(`${API.social.profiles.base}/${idOrUsername}`, {
      params: { _t: Date.now() }
    });
  },

  /**
   * Obtener posts de un perfil
   * @param {number} profileId - ID del perfil
   */
  getProfilePosts: async (profileId) => {
    return await Http.get(`${API.social.profiles.base}/${profileId}/posts`);
  },

  /**
   * Obtener amigos de un perfil
   * @param {number} profileId - ID del perfil
   */
  getProfileFriends: async (profileId) => {
    return await Http.get(`${API.social.profiles.base}/${profileId}/friends`);
  },

  /**
   * Obtener solicitudes de amistad (solo para mi perfil)
   * @param {number} profileId - ID del perfil
   */
  getProfileRequests: async (profileId) => {
    return await Http.get(`${API.social.profiles.base}/${profileId}/requests`);
  },

  /**
   * Actualizar perfil
   * @param {number} profileId - ID del perfil
   * @param {object} data - Datos a actualizar
   */
  updateProfile: async (profileId, data) => {
    return await Http.patch(`${API.social.profiles.base}/${profileId}`, data);
  },

  /**
   * Subir avatar
   * @param {number} userId - ID del usuario
   * @param {File} file - Archivo de imagen
   */
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await Http.pload(`${API.social.auth.me}/${userId}/upload`, formData);
  },

  /**
   * Subir cover
   * @param {number} userId - ID del usuario
   * @param {File} file - Archivo de imagen
   */
  uploadCover: async (userId, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return await Http.pload(`${API.social.auth.me}/${userId}/cover-upload`, formData);
  },

  /**
   * Buscar perfiles (para )
   * @param {object} params - Parámetros de básqueda (search, cursor, etc)
   */
  fetchData: async (params) => {
    return await Http.get(API.social.profiles.base, { params });
  },

  /**
   * Buscar perfiles por query
   * @param {string} query - Túrmino de básqueda
   */
  search: async (query) => {
    return await Http.get(API.social.profiles.search, { q: query });
  },

  /**
   * Enviar solicitud de amistad
   * @param {number} targetId - ID del usuario objetivo
   */
  sendFriendRequest: async (targetId) => {
    return await Http.post(API.social.friendships, {
      target_social_user_id: targetId
    });
  },

  /**
   * Crear perfil (admin)
   * @param {object} data - Datos del perfil
   */
  create: async (data) => {
    return await Http.post(API.social.profiles.base, data);
  },

  /**
   * Actualizar perfil (admin - PUT completo)
   * @param {number} id - ID del perfil
   * @param {object} data - Datos del perfil
   */
  update: async (id, data) => {
    return await Http.put(`${API.social.profiles.base}/${id}`, data);
  },

  /**
   * Eliminar perfil (admin)
   * @param {number} id - ID del perfil
   */
  delete: async (id) => {
    return await Http.delete(`${API.social.profiles.base}/${id}`);
  }
};
