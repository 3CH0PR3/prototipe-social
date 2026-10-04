import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AuthService } from '../services/auth.service';
import { useTokenStore } from '@/stores/useToken.store';
import { useUserStore } from '@social/pages/user/stores/useUser.store.js';

export const useAuthStore = defineStore('social.auth', () => {
  const tokenStore = useTokenStore();
  const errorMsg = ref(null);
  const isLoadingAuth = ref(false);
  const isAuthenticated = ref(false);
  const isSessionChecked = ref(false);

  let fetchPromise = null;

  const setLoading = (val) => (isLoadingAuth.value = val);
  const setErrors = (err) => (errorMsg.value = err);
  const clearError = () => (errorMsg.value = null);

  const executeAsync = async (fn) => {
    clearError();
    setLoading(true);
    try {
      return await fn();
    } catch (error) {
      setErrors(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (payload) => {
    return executeAsync(async () => {
      const resp = await AuthService.login(payload);

      const access_token = resp?.data?.token || resp?.data?.access_token;
      const authenticated = resp?.data?.authenticated;
      const requires_otp = resp?.data?.requires_otp;

      if (access_token) {
        tokenStore.set(access_token, 'social');
      }

      if (authenticated && access_token) {
        isAuthenticated.value = true;
        isSessionChecked.value = true;

        try {
          const { data: meData } = await AuthService.me();
          if (meData?.user?.id) useUserStore().setUser(meData.user);
        } catch (err) {
          console.error('Error fetching user data after login:', err);
        }
      }

      return resp;
    });
  };

  const handleRegister = async (payload) => {
    return executeAsync(async () => {
      const resp = await AuthService.register(payload);

      const access_token = resp?.data?.token || resp?.data?.access_token;
      const authenticated = resp?.data?.authenticated;

      if (authenticated && access_token) {
        tokenStore.set(access_token, 'social');
        isAuthenticated.value = true;
        isSessionChecked.value = true;

        try {
          const { data: meData } = await AuthService.me();
          if (meData?.user?.id) useUserStore().setUser(meData.user);
        } catch (err) {
          console.warn('Error fetching user data after register:', err);
        }
      }

      return resp;
    });
  };

  const handleLogout = async () => {
    return executeAsync(async () => {
      tokenStore.clear('social');
      useUserStore().clearUser();
      isAuthenticated.value = false;
      isSessionChecked.value = false;
    });
  };

  const searchAccount = async (payload) => {
    return executeAsync(async () => {
      const response = await AuthService.account(payload);
      return response;
    });
  };

  const verifyCode = async (payload) => {
    return executeAsync(async () => {
      return await AuthService.verifyCode(payload);
    });
  };

  const resendCode = async (payload) => {
    return executeAsync(async () => {
      return await AuthService.resendCode(payload);
    });
  };

  const verifyOtp = async (payload) => {
    return executeAsync(async () => {
      const resp = await AuthService.verifyOtp(payload);
      const access_token = resp?.data?.token || resp?.data?.access_token;
      if (access_token) {
        tokenStore.set(access_token, 'social');
        isAuthenticated.value = true;
        isSessionChecked.value = true;

        try {
          const { data: meData } = await AuthService.me();
          if (meData?.user?.id) useUserStore().setUser(meData.user);
        } catch (err) {
          console.warn('Error fetching user data after verifyOtp:', err);
        }
      }
      return resp;
    });
  };

  const resendOtp = async () => {
    return executeAsync(async () => {
      return await AuthService.resendOtp();
    });
  };

  const resetPassword = async (payload) => {
    return executeAsync(async () => {
      return await AuthService.reset(payload);
    });
  };

  const forgetSession = async (payload) => {
    return executeAsync(async () => {
      return await AuthService.forget(payload);
    });
  };

  const checkResetStatus = async (payload) => {
    return executeAsync(async () => {
      return await AuthService.checkResetStatus(payload);
    });
  };

  const checkSession = async () => {
    if (isSessionChecked.value) return isAuthenticated.value;
    if (fetchPromise) return fetchPromise;

    fetchPromise = executeAsync(async () => {
      const token = tokenStore.getToken('social');
      if (!token) {
        isAuthenticated.value = false;
        isSessionChecked.value = true;
        useUserStore().clearUser();
        return false;
      }

      const response = await AuthService.me();
      isAuthenticated.value = !!response?.data?.user?.id;

      if (isAuthenticated.value) {
        useUserStore().setUser(response.data.user);
      } else {
        useUserStore().clearUser();
      }

      isSessionChecked.value = true;
      return isAuthenticated.value;
    })
      .catch(() => {
        isAuthenticated.value = false;
        isSessionChecked.value = true;
        useUserStore().clearUser();
        tokenStore.clear('social');
        throw new Error('Not authenticated');
      })
      .finally(() => {
        fetchPromise = null;
      });

    return fetchPromise;
  };

  return {
    errorMsg,
    isLoadingAuth,
    isAuthenticated,
    isSessionChecked,
    checkSession,
    handleLogin,
    handleRegister,
    handleLogout,
    searchAccount,
    resendCode,
    verifyCode,
    resetPassword,
    forgetSession,
    checkResetStatus,
    verifyOtp,
    resendOtp
  };
});
