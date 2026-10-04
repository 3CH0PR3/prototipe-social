import { Http, API } from '@shared/http/Http';

export const CompaniesService = {
  search: async (params) => {
    return await Http.get(API.social.companies.search, params);
  },

  apply: async (tenantId, data) => {
    return await Http.post(API.social.companies.apply(tenantId), data);
  },

  getDepartments: async () => {
    return await Http.get(API.social.locations.departments);
  },

  getMunicipalities: async (departmentCode) => {
    return await Http.get(API.social.locations.municipalities(departmentCode));
  }
};
