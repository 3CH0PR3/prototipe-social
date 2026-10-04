import { API, Http } from '@shared/http/Http';

export const MessagesService = {
  fetchData: async (params) => {
    return await Http.get('/social/messages', { params });
  },

  create: async (data) => {
    return await Http.post('/social/messages', data);
  },

  update: async (id, data) => {
    return await Http.put(`/social/messages/${id}`, data);
  },

  delete: async (id) => {
    return await Http.delete(`/social/messages/${id}`);
  }
};
