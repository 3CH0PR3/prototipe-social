import { API, Http } from '@shared/http/Http';

export const ProfilesService = {
  fetchData: async (params) => {
    return await Http.get(API.social.profiles.base, { params });
  },

  search: async (query) => {
    return await Http.get(API.social.profiles.search, { q: query });
  },

  getProfile: async (username) => {
    return await Http.get(`${API.social.profiles.base}/${username}`, {
      params: { _t: Date.now() }
    });
  },

  getProfilePosts: async (profileId) => {
    return await Http.get(`${API.social.profiles.base}/${profileId}/posts`);
  },

  getProfileFriends: async (profileId) => {
    return await Http.get(`${API.social.profiles.base}/${profileId}/friends`);
  },

  sendFriendRequest: async (targetId) => {
    return await Http.post(API.social.friendships, {
      target_social_user_id: targetId
    });
  },

  create: async (data) => {
    return await Http.post(API.social.profiles.base, data);
  },

  update: async (id, data) => {
    return await Http.put(`${API.social.profiles.base}/${id}`, data);
  },

  delete: async (id) => {
    return await Http.delete(`${API.social.profiles.base}/${id}`);
  }
};
