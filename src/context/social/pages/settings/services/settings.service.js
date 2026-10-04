import { API, Http } from '@shared/http/Http';

export const SettingsService = {
  fetchData: async (params) => {
    return await Http.get('/social/settings', { params });
  },

  create: async (data) => {
    return await Http.post('/social/settings', data);
  },

  update: async (id, data) => {
    return await Http.put(`/social/settings/${id}`, data);
  },

  delete: async (id) => {
    return await Http.delete(`/social/settings/${id}`);
  }
};
