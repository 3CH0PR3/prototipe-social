import { API, Http } from '@shared/http/Http';

export const CompanyActivityService = {
  async fetchCentral() {
    return await Http.get(API.central.companies.activity(props.company.id));
  }
};
