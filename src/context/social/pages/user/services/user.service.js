import { API, Http } from '@shared/http/Http';

export const UserService = {
  async me() {
    return await Http.get(API.social.auth.me);
  },

  async updateProfile(payload) {
    return await Http.put('/social/profiles/me', payload);
  },

  async updateAvatar(formData) {
    return await Http.post('/social/profiles/me/avatar', formData);
  }
};
