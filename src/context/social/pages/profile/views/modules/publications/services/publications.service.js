import { API, Http } from '@shared/http/Http';

export const publicationsService = {
  /**
   * Obtiene los posts del usuario autenticado
   * @param {string} userId - UUID del usuario (no username)
   */
  fetchMyPosts: async (userId) => {
    return await Http.get(API.social.posts, { social_user_id: userId });
  },

  createPost: async (data) => {
    return await Http.post(API.social.posts, data);
  },

  updatePost: async (id, data) => {
    return await Http.put(`${API.social.posts}/${id}`, data);
  },

  deletePost: async (id) => {
    return await Http.delete(`${API.social.posts}/${id}`);
  }
};
