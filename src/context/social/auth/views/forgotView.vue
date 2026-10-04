<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/useAuth.store';
import { useRouter } from 'vue-router';
import { Loader2, CheckCircle2, Send } from '@lucide/vue';
import { useForm } from '@shared/composables/useForm';
import { useFormForgot } from '../composables/useFormLogin';

import FormField from '@/shared/components/form/FormField.vue';
import TextInput from '@/shared/components/form/TextInput.vue';
import SubmitButton from '@/shared/components/button/SubmitButton.vue';

const store = useAuthStore();
const router = useRouter();

const form = useForm({ email: '' });
const { validate } = useFormForgot(form);

const submit = async () => {
  if (!validate()) return;

  form.processing = true;

  try {
    const resp = await store.searchAccount(form.data());
    const uid = resp.data.uid;
    router.replace({ name: 'social.verify-code', params: { uid } });
  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors) form.setErrors(errors);
    else form.setError('email', err.response?.data?.message);
  } finally {
    form.processing = false;
  }
};
</script>

<template>
  <div class="w-full">
    <div class="mb-10">
      <h2 class="text-3xl font-bold tracking-tight text-text-primary">Recuperar contraseña</h2>
      <p class="mt-2 text-sm text-text-secondary">
        Ingresa tu correo y te enviaremos un código de .
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
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

      <SubmitButton
        type="submit"
        :loading="form.processing"
        loading-text="Enviando"
        class="w-full text-xs md:text-sm"
      >
        Enviar código
        <Send class="h-4 w-4 text-white" />
      </SubmitButton>
    </form>

    <div class="text-center mt-4">
      <RouterLink
        :to="{ name: 'social.login' }"
        class="text-sm font-medium text-text-secondary hover:text-text-primary hover:underline transition-colors"
      >
        Volver a iniciar sesión
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
