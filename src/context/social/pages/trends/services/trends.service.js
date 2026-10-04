import { API, Http } from '@shared/http/Http';

export const TrendsService = {
  fetchData: async (params) => {
    return await Http.get('/social/trends', { params });
  },

  create: async (data) => {
    return await Http.post('/social/trends', data);
  },

  update: async (id, data) => {
    return await Http.put(`/social/trends/${id}`, data);
  },

  delete: async (id) => {
    return await Http.delete(`/social/trends/${id}`);
  }
};
