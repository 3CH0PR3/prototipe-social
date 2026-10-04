import { API, Http } from '@shared/http/Http';

export const NotificationsService = {
  fetchData: async (params) => {
    return await Http.get('/api/v1/social/notifications', { params });
  },

  markRead: async (id) => {
    return await Http.put(`/api/v1/social/notifications/${id}/read`);
  },

  markAllRead: async () => {
    return await Http.put(`/api/v1/social/notifications/read-all`);
  }
};
