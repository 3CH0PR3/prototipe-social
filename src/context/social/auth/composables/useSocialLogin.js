import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { build } from '@/config/api/core/core';

const ERROR_MESSAGES = {
  account_not_found: 'No encontramos una cuenta asociada a este correo.',
  auth_failed: 'Ocurrió un error al autenticar con la red social.'
};

export function useSocialLogin(form) {
  const route = useRoute();
  const router = useRouter();

  const urlError = ref('');
  const socialProviderLoading = ref('');

  onMounted(() => {
    const errorKey = route.query.error;
    if (errorKey) {
      urlError.value = ERROR_MESSAGES[errorKey] || 'Ocurrió un error desconocido.';
      // Limpiamos la URL instantáneamente sin recargar la página
      router.replace({ query: {} });
    }
  });

  const getAuthUrl = (provider) => {
    return `${build('auth', `${provider}/redirect`)}?context=social`;
  };

  const handleSocialClick = (provider, e) => {
    if (form.processing) {
      e.preventDefault();
      return;
    }
    socialProviderLoading.value = provider;
    form.processing = true;
  };

  return {
    urlError,
    socialProviderLoading,
    getAuthUrl,
    handleSocialClick
  };
}
