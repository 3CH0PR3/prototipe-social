import { API, Http } from '@shared/http/Http';

export const RolesService = {
  async fetch() {
    return await Http.get(API.central.roles);
  }
};
