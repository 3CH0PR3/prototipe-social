<script setup>
import { useRouter } from 'vue-router';
import { Loader2 } from '@lucide/vue';
import { useAuthStore } from '../stores/useAuth.store';
import { useForm } from '@shared/composables/useForm';
import { useFormLogin } from '../composables/useFormLogin';
import { useSocialLogin } from '../composables/useSocialLogin';

import FormField from '@shared/components/form/FormField.vue';
import TextInput from '@shared/components/form/TextInput.vue';
import PasswordInput from '@shared/components/form/PasswordInput.vue';
import SubmitButton from '@shared/components/button/SubmitButton.vue';
import SocialProviderButton from '../components/SocialProviderButton.vue';

const router = useRouter();
const form = useForm({ email: '', password: '' });
const store = useAuthStore();

const { validate } = useFormLogin(form);
const {
  urlError,
  socialProviderLoading,
  getAuthUrl,
  handleSocialClick
} = useSocialLogin(form);

const handleLogin = async () => {
  if (!validate()) return;
  form.processing = true;

  try {
    const resp = await store.handleLogin(form.data());
    if (resp?.data?.requires_otp) router.push({ name: 'social.verify-otp' });
    else router.push({ name: 'social.feed' });
  } catch (err) {
    const errors = err?.response?.data?.errors;
    if (errors) form.setErrors(errors);
  } finally { form.processing = false }
};
</script>

<template>
  <div class="w-full">
    <div class="mb-6 md:mb-8 text-center md:text-left">
      <h2 class="text-xl md:text-2xl font-bold tracking-tight text-text-primary">Bienvenido a GEA-social</h2>
      <p class="text-xs md:text-sm text-text-secondary mt-1">Inicia sesión en tu cuenta para continuar.</p>
    </div>

    <div
      v-if="urlError"
      class="mb-5 md:mb-6 rounded-md bg-red-50 p-3 md:p-4 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50"
    >
      <div class="flex items-start md:items-center text-left">
        <div class="flex-shrink-0 mt-0.5 md:mt-0">
          <svg class="h-4 w-4 md:h-5 md:w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-2 md:ml-3">
          <h3 class="text-xs md:text-sm text-red-800 dark:text-red-200">
            {{ urlError }}
          </h3>
        </div>
      </div>
    </div>

    <div class="mb-5 md:mb-6 flex gap-2.5 md:gap-3">
      <SocialProviderButton
        provider="google"
        label="Google"
        :href="getAuthUrl('google')"
        :is-loading="socialProviderLoading === 'google'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'google')"
        @click="handleSocialClick('google', $event)"
      />

      <SocialProviderButton
        provider="github"
        label="GitHub"
        :href="getAuthUrl('github')"
        :is-loading="socialProviderLoading === 'github'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'github')"
        @click="handleSocialClick('github', $event)"
      />

      <SocialProviderButton
        provider="azure"
        label="Microsoft"
        :href="getAuthUrl('azure')"
        :is-loading="socialProviderLoading === 'azure'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'azure')"
        @click="handleSocialClick('azure', $event)"
      />
    </div>

    <div class="mt-5 mb-4 md:mt-6 md:mb-4">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border dark:border-border/10"></div>
        </div>
        <div class="relative flex justify-center text-xs md:text-sm">
          <span class="bg-background px-4 text-text-muted">o</span>
        </div>
      </div>
    </div>

    <form class="space-y-3 md:space-y-4" @submit.prevent="handleLogin">
      <FormField label="Correo electrónico" for-id="email" :error="form.errors.email">
        <TextInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="nombre@email.com"
          :disabled="form.processing"
          :error="!!form.errors.email"
        />
      </FormField>

      <FormField label="Contraseña" for-id="password" :error="form.errors.password">
        <PasswordInput
          id="password"
          v-model="form.password"
          placeholder="Escribe tu contraseña aquí"
          :disabled="form.processing"
          :error="!!form.errors.password"
        />
      </FormField>

      <SubmitButton
        type="submit"
        :loading="form.processing"
        loading-text="Iniciando sesión"
        class="w-full mt-3 md:mt-4 py-2 md:py-2.5 text-xs md:text-sm"
      >
        Iniciar sesión
      </SubmitButton>
    </form>

    <div
      class="mt-5 md:mt-6 flex flex-col md:flex-row items-center justify-between text-xs md:text-sm space-y-3 md:space-y-0"
    >
      <p class="text-text-secondary">
        ¿No tienes una cuenta?
        <RouterLink
          :to="{ name: 'social.register' }"
          class="font-semibold text-text-primary hover:underline transition-all"
        >
          Regístrate
        </RouterLink>
      </p>

      <RouterLink
        :to="{ name: 'social.forgot' }"
        class="text-text-secondary hover:text-text-primary hover:underline transition-all"
      >
        ¿Olvidaste tu contraseña?
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
