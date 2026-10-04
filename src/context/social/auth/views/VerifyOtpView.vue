<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../stores/useAuth.store';
import { useRouter } from 'vue-router';
import { Loader2, Lock } from '@lucide/vue';
import { useForm } from '@shared/composables/useForm';
import { ArrowLeft } from 'reicon-vue';
import OtpInput from '@/shared/components/form/OtpInput.vue';
import InputError from '@shared/components/form/InputError.vue';
import { useTokenStore } from '@/stores/useToken.store';

const store = useAuthStore();
const tokenStore = useTokenStore();
const router = useRouter();

const codeForm = useForm({ code: '' });
const inputRef = ref(null);
const cancelling = ref(false);

const isBlocked = ref(false);
const isResending = ref(false);
const timeLeft = ref(60);
let timer = null;

const formattedTimeLeft = computed(() => {
  if (timeLeft.value < 60) return `${timeLeft.value}s`;
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
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

  if (!tokenStore.getToken('social')) {
    router.replace({ name: 'social.login' });
    return;
  }

  startTimer(60);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleResendCode = async () => {
  if (timeLeft.value > 0 || isResending.value) return;

  isResending.value = true;
  codeForm.clearErrors();

  try {
    await store.resendOtp();
    codeForm.code = '';
    startTimer(60);
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
    await store.handleLogout();
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
    await store.verifyOtp({ code: codeForm.code });
    router.replace({ name: 'social.feed' });
  } catch (error) {
    const data = error?.response?.data;
    const msg = data?.message || 'Código inválido o expirado.';
    codeForm.setErrors({ code: msg });
    codeForm.code = '';

    if (error?.response?.status === 429 || error?.response?.status === 423) {
      isBlocked.value = true;
      startTimer(300);
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
    <div>
      <div class="mb-6 flex justify-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-green-900/50 dark:bg-green-950/20"
        >
          <Lock class="h-7 w-7 text-text-secondary" />
        </div>
      </div>

      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-text-primary"> de dos pasos</h2>
        <p class="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
          Ingresa el código de 6 dígitos que enviamos a tu correo para iniciar sesión.
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

        <InputError :message="codeForm.errors.code" class="text-center mt-2" />

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
          <span>Volver</span>
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
