<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuth.store';
import { useTokenStore } from '@/stores/useToken.store';
import { Loader2 } from '@lucide/vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const tokenStore = useTokenStore();

onMounted(async () => {
  const token = route.query.token;
  if (token) {
    // 1. Guardar el token en el contexto 'social'
    tokenStore.set(token, 'social');

    // 2. Forzar un chequeo de sesión para cargar los datos del usuario
    try {
      authStore.isSessionChecked = false; // Reset to force fetch
      await authStore.checkSession();
      router.push({ name: 'social.feed' });
    } catch (e) {
      router.push({ name: 'social.login', query: { error: 'auth_failed' } });
    }
  } else {
    router.push({ name: 'social.login', query: { error: 'invalid_token' } });
  }
});
</script>

<template>
  <div class="flex h-[50vh] w-full items-center justify-center">
    <div class="flex flex-col items-center space-y-4">
      <Loader2 class="h-10 w-10 animate-spin text-brand" />
      <p class="text-sm font-medium text-text-secondary">Autenticando, por favor espera...</p>
    </div>
  </div>
</template>
