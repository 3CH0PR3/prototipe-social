import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFlashStore = defineStore('system.flash', () => {
  const success = ref(null);
  const warning = ref(null);
  const error = ref(null);

  const setSuccess = (message) => {
    success.value = message;
  };
  const setWarning = (message) => {
    warning.value = message;
  };
  const setError = (message) => {
    error.value = message;
  };

  const clear = () => {
    success.value = null;
    warning.value = null;
    error.value = null;
  };

  return {
    success,
    warning,
    error,
    setSuccess,
    setWarning,
    setError,
    clear
  };
});
