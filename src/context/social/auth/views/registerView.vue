<script setup>
import { ref, computed } from 'vue';
import { Loader2 } from '@lucide/vue';
import { useRouter } from 'vue-router';
import { useForm } from '@shared/composables/useForm';
import { useAuthStore } from '../stores/useAuth.store';
import { useSocialRegister } from '../composables/useSocialRegister';

import FormField from '@/shared/components/form/FormField.vue';
import TextInput from '@/shared/components/form/TextInput.vue';
import PasswordInput from '@/shared/components/form/PasswordInput.vue';
import Checkbox from '@/shared/components/form/Checkbox.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';
import SocialProviderButton from '../components/SocialProviderButton.vue';

const store = useAuthStore();
const router = useRouter();

const form = useForm({
  first_name: '',
  paternal_surname: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false
});

const { urlError, socialProviderLoading, getAuthRegisterUrl, handleSocialClick } = useSocialRegister(form);

const errorMessage = ref('');

const passwordMatch = computed(() => {
  if (!form.password || !form.password_confirmation) return true;
  return form.password === form.password_confirmation;
});

const handleRegister = async () => {
  if (!form.terms) {
    errorMessage.value = 'Debes aceptar los Términos y Condiciones.';
    return;
  }
  if (!passwordMatch.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  errorMessage.value = '';
  form.processing = true;
  form.clearErrors();

  try {
    const resp = await store.handleRegister(form.data());
    if (resp?.data?.authenticated) {
      router.push({ name: 'social.feed' });
    }
  } catch (err) {
    const errors = err?.response?.data?.errors;
    if (errors) form.setErrors(errors);
  } finally { form.processing = false; }
};
</script>

<template>
  <div class="w-full">
    <div class="mb-6 md:mb-8 text-center md:text-left">
      <h2 class="text-xl md:text-3xl font-bold tracking-tight text-text-primary">Crea tu cuenta GEA</h2>
      <p class="mt-1 md:mt-2 text-xs md:text-sm text-text-secondary">
        Únete a nuestra plataforma y conecta con el mundo.
      </p>
    </div>

    <!-- Error Alerts -->
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

    <div v-if="errorMessage" class="mb-5 md:mb-6 rounded-md bg-red-50 p-3 md:p-4 border border-red-100">
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
          <h3 class="text-xs md:text-sm font-medium text-red-800">
            {{ errorMessage }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Social Buttons (Top) -->
    <div class="mb-5 md:mb-6 flex gap-2.5 md:gap-3">
      <SocialProviderButton
        provider="google"
        label="Google"
        :href="getAuthRegisterUrl('google')"
        :is-loading="socialProviderLoading === 'google'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'google')"
        @click="handleSocialClick('google', $event)"
      />

      <SocialProviderButton
        provider="github"
        label="GitHub"
        :href="getAuthRegisterUrl('github')"
        :is-loading="socialProviderLoading === 'github'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'github')"
        @click="handleSocialClick('github', $event)"
      />

      <SocialProviderButton
        provider="azure"
        label="Microsoft"
        :href="getAuthRegisterUrl('azure')"
        :is-loading="socialProviderLoading === 'azure'"
        :is-disabled="form.processing || (socialProviderLoading !== '' && socialProviderLoading !== 'azure')"
        @click="handleSocialClick('azure', $event)"
      />
    </div>

    <!-- Divider -->
    <div class="mt-5 mb-4 md:mt-6 md:mb-4">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border dark:border-border/10"></div>
        </div>
        <div class="relative flex justify-center text-xs md:text-sm">
          <span class="bg-background px-4 text-text-muted">o usa tu correo</span>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form class="space-y-3 md:space-y-4" @submit.prevent="handleRegister">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <FormField label="Nombre(s)" for-id="first_name" :error="form.errors.first_name">
          <TextInput
            id="first_name"
            v-model="form.first_name"
            type="text"
            required
            placeholder="Tu nombre"
            :disabled="form.processing"
            :error="!!form.errors.first_name"
          />
        </FormField>

        <FormField label="Apellido paterno" for-id="paternal_surname" :error="form.errors.paternal_surname">
          <TextInput
            id="paternal_surname"
            v-model="form.paternal_surname"
            type="text"
            required
            placeholder="Tu apellido"
            :disabled="form.processing"
            :error="!!form.errors.paternal_surname"
          />
        </FormField>
      </div>

      <FormField label="Correo electrónico" for-id="email" :error="form.errors.email">
        <TextInput
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="nombre@email.com"
          :disabled="form.processing"
          :error="!!form.errors.email"
        />
      </FormField>

      <FormField label="Contraseña" for-id="password" :error="form.errors.password">
        <PasswordInput
          id="password"
          v-model="form.password"
          required
          placeholder="Mínimo 8 caracteres"
          :disabled="form.processing"
          :error="!!form.errors.password"
        />
      </FormField>

      <FormField
        label="Confirmar contraseña"
        for-id="password_confirmation"
        :error="!passwordMatch ? 'Las contraseñas no coinciden' : form.errors.password_confirmation"
      >
        <PasswordInput
          id="password_confirmation"
          v-model="form.password_confirmation"
          required
          placeholder="Vuelve a escribir la contraseña"
          :disabled="form.processing"
          :error="!!form.errors.password_confirmation"
        />
      </FormField>

      <div class="flex items-start md:items-center mt-2">
        <div class="flex items-center h-5 md:h-auto">
          <Checkbox id="terms" v-model:checked="form.terms" required />
        </div>
        <label
          for="terms"
          class="ml-2 block text-xs md:text-sm text-text-secondary cursor-pointer leading-tight md:leading-normal"
        >
          Acepto los
          <a href="#" class="font-semibold text-text-primary hover:underline transition-all">
            Términos y Condiciones
          </a>
        </label>
      </div>

      <SubmitButton
        type="submit"
        :disabled="!form.terms || !passwordMatch"
        :loading="form.processing"
        loading-text="Creando cuenta..."
        class="w-full mt-3 md:mt-4 py-2 md:py-2.5 text-xs md:text-sm"
      >
        Crear cuenta
      </SubmitButton>
    </form>

    <div class="text-center mt-5 md:mt-6 mb-4">
      <span class="text-xs md:text-sm text-text-secondary">¿Ya tienes cuenta?</span>
      <router-link
        :to="{ name: 'social.login' }"
        class="ml-1 text-xs md:text-sm font-semibold text-text-primary hover:underline transition-all"
      >
        Inicia sesión
      </router-link>
    </div>
  </div>
</template>
