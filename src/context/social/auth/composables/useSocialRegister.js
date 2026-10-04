import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { build } from '@/config/api/core/core';

const ERROR_MESSAGES = {
  account_already_exists: 'Este correo ya está registrado en una cuenta existente.',
  registration_failed: 'Ocurrió un error al intentar registrarte con la red social.'
};

export function useSocialRegister(form) {
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

  const getAuthRegisterUrl = (provider) => {
    // Usamos el builder de tu config, apuntando al endpoint de register
    return `${build('auth', `${provider}/register/redirect`)}?context=social`;
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
    getAuthRegisterUrl,
    handleSocialClick
  };
}
