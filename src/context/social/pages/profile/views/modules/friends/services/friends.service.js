import { API, Http } from '@shared/http/Http';

export const friendsService = {
  /**
   * Obtiene la lista de amigos del usuario
   * @param {string} userId - UUID o username del usuario
   */
  fetchFriends: async (userId) => {
    return await Http.get(`${API.social.profiles.base}/${userId}/friends`);
  },

  /**
   * Obtiene las solicitudes de amistad pendientes
   * @param {string} userId - UUID o username del usuario
   */
  fetchRequests: async (userId) => {
    return await Http.get(`${API.social.profiles.base}/${userId}/requests`);
  }
};
