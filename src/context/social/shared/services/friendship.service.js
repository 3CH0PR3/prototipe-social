import { API, Http } from '@shared/http/Http';

export const friendshipService = {
  sendFriendRequest(userId) {
    return Http.post(API.social.friendships, { target_social_user_id: userId });
  },

  cancelFriendRequest(userId) {
    return Http.delete(`${API.social.friendships}/${userId}`);
  },

  acceptFriendRequest(userId) {
    return Http.put(`${API.social.friendships}/${userId}`, {
      action: 'status',
      status_code: 2
    });
  },

  removeFriend(userId) {
    return Http.delete(`${API.social.friendships}/${userId}`);
  }
};
