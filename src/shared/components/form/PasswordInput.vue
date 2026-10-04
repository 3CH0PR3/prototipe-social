<script setup>
import { ref } from 'vue';
import { Eye, EyeOff } from '@lucide/vue';

defineOptions({
  inheritAttrs: false
});

defineProps({
  modelValue: { type: [String, Number], default: '' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '••••••••' },
  id: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  autocomplete: { type: String, default: 'current-password' }
});

const emit = defineEmits(['update:modelValue']);

const input = ref(null);
const visible = ref(false);

defineExpose({
  focus: () => input.value?.focus()
});
</script>

<template>
  <div class="relative">
    <!-- Dummy input to trap browser credential manager username autofill -->
    <input
      type="text"
      name="dummy-username-autofill"
      autocomplete="username"
      style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; left: -9999px;"
      tabindex="-1"
      aria-hidden="true"
    />
    <input
      ref="input"
      v-bind="$attrs"
      :id="id"
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="['input-field pr-12', inputClass, { '!input-field--error': error }]"
      :autocomplete="autocomplete"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      tabindex="-1"
      @click="visible = !visible"
    >
      <EyeOff v-if="visible" class="h-4 w-4" />
      <Eye v-else class="h-4 w-4" />
    </button>
  </div>
</template>
