<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/useAuth.store';
import { useRouter, useRoute } from 'vue-router';
import { Loader2, Save, XCircle } from '@lucide/vue';
import { useForm } from '@shared/composables/useForm';

import FormField from '@/shared/components/form/FormField.vue';
import PasswordInput from '@/shared/components/form/PasswordInput.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = useForm({
  token: route.params.token || '',
  uid: route.params.uid || '',
  password: '',
  password_confirmation: ''
});

const cancelling = ref(false);
const isValidating = ref(true);

onMounted(async () => {
  if (!route.params.uid || !route.params.token) {
    router.replace({ name: 'social.forgot' });
    return;
  }

  try {
    await store.checkResetStatus({
      uid: route.params.uid,
      token: route.params.token
    });
  } catch (error) {
    router.replace({ name: 'social.login' });
  } finally {
    isValidating.value = false;
  }
});

const handleCancel = async () => {
  cancelling.value = true;
  try {
    await store.forgetSession({ uid: route.params.uid });
  } catch (err) {
    console.error(err);
  } finally {
    router.replace({ name: 'social.login' });
  }
};

const handleResetPassword = async () => {
  form.processing = true;
  form.clearErrors();
  try {
    await store.resetPassword(form.data());

    form.recentlySuccessful = true;
    setTimeout(() => {
      router.replace({ name: 'social.login' });
    }, 3000);
  } catch (error) {
    const data = error?.response?.data;
    if (data?.errors) {
      form.setErrors(data.errors);
    } else {
      form.setErrors({
        password: data?.message || 'No se pudo restablecer la contraseña.'
      });
    }
  } finally {
    form.processing = false;
  }
};
</script>

<template>
  <div class="w-full">
    <div v-if="isValidating" class="flex flex-col items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-brand" />
      <p class="mt-4 text-sm text-text-secondary">Verificando enlace...</p>
    </div>

    <div v-else>
      <div class="mb-10">
        <h2 class="text-3xl font-bold tracking-tight text-text-primary">Nueva contraseña</h2>
        <p class="mt-2 text-sm text-text-secondary">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
      </div>

      <div
        v-if="form.recentlySuccessful"
        class="mb-6 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-300">
              Tu contraseña ha sido restablecida con éxito. Redirigiendo...
            </h3>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleResetPassword" v-if="!form.recentlySuccessful">
        <FormField label="Nueva contraseña" for-id="password" :error="form.errors.password">
          <PasswordInput
            id="password"
            v-model="form.password"
            placeholder="••••••••"
            :error="!!form.errors.password"
          />
        </FormField>

        <FormField
          label="Confirmar nueva contraseña"
          for-id="password_confirmation"
          :error="form.errors.password_confirmation"
        >
          <PasswordInput
            id="password_confirmation"
            v-model="form.password_confirmation"
            placeholder="••••••••"
            :error="!!form.errors.password"
          />
        </FormField>

        <SubmitButton
          type="submit"
          :disabled="form.processing"
          :loading="form.processing"
          loading-text="Restableciendo"
        >
          Restablecer contraseña
        </SubmitButton>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
