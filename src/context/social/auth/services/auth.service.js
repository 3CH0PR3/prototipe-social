import { API, Http } from '@shared/http/Http';

export const AuthService = {
  async me() {
    return await Http.get(API.social.auth.me);
  },

  async login(payload) {
    return await Http.post(API.social.auth.login, payload);
  },

  async register(payload) {
    return await Http.post(API.social.auth.register, payload);
  },

  async verifyOtp(payload) {
    return await Http.post(API.social.auth.verifyOtp, payload);
  },

  async resendOtp() {
    return await Http.post(API.social.auth.resendOtp);
  },

  async account(payload) {
    return await Http.post(API.social.auth.password.findAccount, payload);
  },
  async resendCode(payload) {
    return await Http.post(API.social.auth.password.resendCode, payload);
  },
  async verifyCode(payload) {
    return await Http.post(API.social.auth.password.verifyCode, payload);
  },
  async reset(payload) {
    return await Http.post(API.social.auth.password.reset, payload);
  },
  async forget(payload) {
    return await Http.post(API.social.auth.password.forget, payload);
  },
  async checkResetStatus(payload) {
    return await Http.post(API.social.auth.password.checkResetStatus, payload);
  }
};
