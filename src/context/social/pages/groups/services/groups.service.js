import { API, Http } from '@shared/http/Http';

export const GroupsService = {
  fetchData: async (params) => {
    return await Http.get(API.social.groups.base, { params });
  },

  create: async (data) => {
    return await Http.post(API.social.groups.base, data);
  },

  update: async (id, data) => {
    return await Http.put(`${API.social.groups.base}/${id}`, data);
  },

  delete: async (id) => {
    return await Http.delete(`${API.social.groups.base}/${id}`);
  },

  join: async (id) => {
    return await Http.post(API.social.groups.join(id));
  },

  leave: async (id) => {
    return await Http.post(API.social.groups.leave(id));
  }
};
