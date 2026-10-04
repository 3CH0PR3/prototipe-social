import { client } from './client';
import { apiUrl, frontendUrl } from '@config/api/core/core';
import { appDomain as domain, prefix } from '@config/api/core/urls';
import { setupInterceptors } from '@config/interceptor';

import { landingApi } from '@config/api/resources/landing.api';
import { centralApi } from '@config/api/resources/central.api';
import { companyApi } from '@config/api/resources/company.api';
import { memberApi } from '@config/api/resources/member.api';
import { socialApi } from '@config/api/resources/social.api';
import { clientApi } from '@config/api/resources/client.api';

setupInterceptors(client);

export const API = {
  domain,
  prefix,
  apiUrl,
  frontendUrl,

  landing: landingApi,
  central: centralApi,
  company: companyApi,
  member: memberApi,
  social: socialApi,
  client: clientApi
};

export const Http = {
  get(url, params = {}, config = {}) {
    return client.get(url, { params, ...config });
  },

  post(url, data = {}, config = {}) {
    const isFormData = data instanceof FormData;
    return client.post(url, data, {
      ...(isFormData && { headers: { 'Content-Type': 'multipart/form-data' } }),
      ...config
    });
  },

  put(url, data = {}, config = {}) {
    const isFormData = data instanceof FormData;
    return client.put(url, data, {
      ...(isFormData && { headers: { 'Content-Type': 'multipart/form-data' } }),
      ...config
    });
  },

  patch(url, data = {}, config = {}) {
    return client.patch(url, data, config);
  },

  delete(url, config = {}) {
    return client.delete(url, config);
  },

  upload(url, formData, onProgress = null) {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    // Solo agregar onUploadProgress si se proporciona
    if (onProgress && typeof onProgress === 'function') {
      config.onUploadProgress = onProgress;
    }

    return client.post(url, formData, config);
  },

  download(url, filename = 'download') {
    return client
      .get(url, { responseType: 'blob' })
      .then((response) => {
        // Cambié 'blob' a 'response'
        const blob = response.data; // La data es el blob
        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = fileUrl;
        link.download = filename;
        link.click();

        window.URL.revokeObjectURL(fileUrl);
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
        throw error; // Re-lanzar para manejo en el componente
      });
  }
};
