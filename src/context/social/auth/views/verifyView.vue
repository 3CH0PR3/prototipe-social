<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../stores/useAuth.store';
import { useRouter, useRoute } from 'vue-router';
import { Loader2, KeyRound, XCircle, Lock } from '@lucide/vue';
import { useForm } from '@shared/composables/useForm';

import OtpInput from '@/shared/components/form/OtpInput.vue';
import { ArrowLeft } from 'reicon-vue';
import InputError from '@shared/components/form/InputError.vue';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const codeForm = useForm({ uid: route.params.uid || '', code: '' });
const inputRef = ref(null);
const cancelling = ref(false);
const isValidating = ref(true);

const isBlocked = ref(false);
const isResending = ref(false);
const timeLeft = ref(60);
let timer = null;

const formattedTimeLeft = computed(() => {
  if (timeLeft.value < 60) return `${timeLeft.value}s`;
  const h = Math.floor(timeLeft.value / 3600);
  const m = Math.floor((timeLeft.value % 3600) / 60);
  const s = timeLeft.value % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
});

const startTimer = (seconds = 60) => {
  timeLeft.value = seconds;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer);
      isBlocked.value = false;
    }
  }, 1000);
};

onMounted(async () => {
  inputRef.value?.focus();

  if (!route.params.uid) {
    router.replace({ name: 'social.forgot' });
    return;
  }

  try {
    await store.checkResetStatus({ uid: route.params.uid });
    startTimer();
  } catch (error) {
    router.replace({ name: 'social.login' });
  } finally {
    isValidating.value = false;
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleResendCode = async () => {
  if (timeLeft.value > 0 || isResending.value) return;

  isResending.value = true;
  codeForm.clearErrors();

  try {
    await store.resendCode({ uid: codeForm.uid });
    codeForm.code = '';
    startTimer();
    inputRef.value?.focus();
  } catch (error) {
    codeForm.setErrors({
      code: 'No se pudo reenviar el código. Intenta nuevamente.'
    });
  } finally {
    isResending.value = false;
  }
};

const handleCancel = async () => {
  cancelling.value = true;
  try {
    await store.forgetSession({ uid: codeForm.uid });
  } catch (err) {
    console.error(err);
  } finally {
    router.replace({ name: 'social.login' });
  }
};

const handleVerifyCode = async () => {
  if (codeForm.code.length !== 6) return;
  if (codeForm.processing || isBlocked.value) return;

  codeForm.processing = true;
  codeForm.clearErrors();
  try {
    const resp = await store.verifyCode(codeForm.data());
    const token = resp?.data?.token;
    router.replace({
      name: 'social.recovery',
      params: { uid: codeForm.uid, token }
    });
  } catch (error) {
    const data = error?.response?.data;
    const msg = data?.message || 'Código inválido o expirado.';
    codeForm.setErrors({ code: msg });
    codeForm.code = ''; // Clear so they can try again

    if (error?.response?.status === 429) {
      isBlocked.value = true;
      let minutes = 1;
      const match = msg.match(/en (\d+) minuto/);

      if (match) {
        minutes = parseInt(match[1], 10);
      } else if (msg.includes('hora')) {
        minutes = 60 * 24; // approx 24h
      }

      startTimer(minutes * 60);
    } else {
      inputRef.value?.focus();
    }
  } finally {
    codeForm.processing = false;
  }
};
</script>

<template>
  <div class="w-full">
    <!-- Validation Loader -->
    <div v-if="isValidating" class="flex flex-col items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-brand" />
      <p class="mt-4 text-sm text-text-secondary">Verificando enlace...</p>
    </div>

    <div v-else>
      <div class="mb-6 flex justify-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-green-900/50 dark:bg-green-950/20"
        >
          <Lock class="h-7 w-7 text-text-secondary" />
        </div>
      </div>

      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-text-primary">Verificar código</h2>
        <p class="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
          Ingresa el código de 6 dígitos que enviamos a tu correo.
        </p>
      </div>

      <div class="mb-4 relative">
        <OtpInput
          ref="inputRef"
          v-model="codeForm.code"
          :error="!!codeForm.errors.code"
          :disabled="codeForm.processing || isResending || isBlocked"
          @complete="handleVerifyCode"
        />

        <InputError :message="codeForm.errors.code" />

        <!-- Inline loader while verifying -->
        <div
          v-if="codeForm.processing"
          class="mt-4 flex justify-center items-center gap-2 text-sm text-brand"
        >
          <Loader2 class="h-4 w-4 animate-spin" />
          Verificando...
        </div>
      </div>

      <div class="mt-8 flex justify-center items-center gap-5">
        <button
          @click="handleCancel"
          :disabled="cancelling"
          class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1 focus:outline-none"
        >
          <Loader2 v-show="cancelling" class="h-4 w-4 animate-spin" />
          <ArrowLeft v-show="!cancelling" class="h-4 w-4" />
          <span>Cancelar</span>
        </button>
        <span class="text-green-900">|</span>
        <button
          type="button"
          @click="handleResendCode"
          :disabled="timeLeft > 0 || isResending || codeForm.processing"
          class="text-sm text-green-700 font-medium transition-colors focus:outline-none"
          :class="
            timeLeft > 0 || codeForm.processing
              ? 'text-text-tertiary cursor-not-allowed'
              : 'text-brand hover:text-brand-600'
          "
        >
          <span v-if="isResending" class="inline-flex items-center gap-1">
            <Loader2 class="h-4 w-4 animate-spin" />
            Reenviando...
          </span>
          <span v-else-if="timeLeft > 0">Reenviar código en {{ formattedTimeLeft }}</span>
          <span v-else>
            No recibí el código,
            <span class="underline">reenviar</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
