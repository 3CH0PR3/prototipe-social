import { API, Http } from '@shared/http/Http';

export const NewsLetterService = {
  async send(payload) {
    return await Http.post(API.landing.letter, payload);
  }
};
