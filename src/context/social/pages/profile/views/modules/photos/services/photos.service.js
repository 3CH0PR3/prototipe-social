import { API, Http } from '@shared/http/Http';

export const photosService = {
  /**
   * Obtiene los posts con imágenes del usuario
   * @param {string} userId - UUID del usuario
   */
  fetchUserPhotos: async (userId) => {
    return await Http.get(API.social.posts, {
      social_user_id: userId,
      has_images: true
    });
  }
};
