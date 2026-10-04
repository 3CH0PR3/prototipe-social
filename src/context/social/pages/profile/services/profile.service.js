import { API, Http } from '@shared/http/Http';

export const profileService = {
  fetchUser: async (id) => {
    return await Http.get(`${API.social.profiles.base}/${id}`);
  },

  fetchPosts: async (userId) => {
    return await Http.get(API.social.posts, { social_user_id: userId });
  },

  fetchFriends: async (userId) => {
    return await Http.get(`${API.social.profiles.base}/${userId}/friends`);
  },

  fetchRequests: async (userId) => {
    return await Http.get(`${API.social.profiles.base}/${userId}/requests`);
  },

  updateProfile: async (profileId, data) => {
    return await Http.patch(`${API.social.profiles.base}/${profileId}`, data);
  },

  uploadAvatar: async (userUid, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await Http.pload(`${API.social.auth.me}/${userUid}/upload`, formData);
  },

  uploadCover: async (userUid, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return await Http.pload(`${API.social.auth.me}/${userUid}/cover-upload`, formData);
  }
};
