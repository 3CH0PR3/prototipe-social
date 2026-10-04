import { NewsLetterService } from '@globalServices/newsLetter.service';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNewsletterStore = defineStore('landing.store', () => {
  const isLoading = ref(false);
  const errorMsg = ref(null);

  const setLoading = (value) => (isLoading.value = value);
  const setErrors = (errors) => (errorMsg.value = errors);
  const clearError = () => (errorMsg.value = null);

  const executeAsync = async (fn) => {
    setLoading(true);
    clearError();
    try {
      return await fn();
    } catch (err) {
      setErrors(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sentLetter = async (payload) => {
    return executeAsync(async () => {
      const resp = await NewsLetterService.send(payload);
      return resp;
    });
  };

  return {
    isLoading,
    errorMsg,

    setLoading,
    setErrors,
    clearError,

    sentLetter
  };
});
