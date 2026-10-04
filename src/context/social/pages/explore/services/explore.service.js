import { API, Http } from '@shared/http/Http';

export const exploreService = {
  getTopics: async () => {
    return [
      { title: '#ReciclaColombia', count: '8.2 mil publicaciones' },
      { title: '#EconomíaCircular', count: '3.6 mil publicaciones' },
      { title: '#GuardianesDelPlaneta', count: '2.1 mil publicaciones' }
    ];
  },

  getPeople: async (params = {}) => {
    return await Http.get(API.social.suggestions, params);
  },

  sendFriendRequest: async (targetUserId) => {
    return await Http.post(API.social.friendships, {
      target_social_user_id: targetUserId
    });
  },

  cancelFriendRequest: async (targetUserId) => {
    return await Http.delete(`${API.social.friendships}/${targetUserId}`);
  },

  removeFriend: async (targetUserId) => {
    return await Http.delete(`${API.social.friendships}/${targetUserId}`);
  },

  searchPeople: async (params = {}) => {
    return await Http.get(API.social.profiles.base, params);
  },

  explore: async (params = {}) => {
    return await Http.get(API.social.explore, params);
  },

  followCompany: async (companyId) => {
    return await Http.post(API.social.follows, {
      followee_id: companyId
    });
  }
};
