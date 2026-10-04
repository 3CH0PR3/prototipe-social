import { toast as toastify } from 'vue3-toastify';

const baseToast = (type, message = 'Error inesperado', options = {}, timeout = 2000) => {
  toastify[type](message, {
    theme: 'light',
    autoClose: timeout,
    ...options
  });
};

export const toast = {
  success(message, options, timeout = 3000) {
    baseToast('success', message, options, timeout);
  },

  error(message, options, timeout) {
    baseToast('error', message, options, timeout);
  },

  info(message, options, timeout) {
    baseToast('info', message, options, timeout);
  },

  warning(message, options, timeout) {
    baseToast('warning', message, options, timeout);
  }
};
