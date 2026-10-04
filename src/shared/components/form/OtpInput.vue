<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 6 },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'complete']);

const digits = ref(Array(props.length).fill(''));
const inputs = ref([]);

// Sync from prop
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === digits.value.join('')) return;
    const chars = newVal.split('').slice(0, props.length);
    digits.value = [...chars, ...Array(props.length - chars.length).fill('')];
  },
  { immediate: true }
);

const focusInput = (index) => {
  if (inputs.value[index]) {
    inputs.value[index].focus();
    // Move cursor to end if there's a value
    setTimeout(() => {
      inputs.value[index].setSelectionRange(1, 1);
    }, 0);
  }
};

const triggerUpdate = () => {
  const val = digits.value.join('');
  emit('update:modelValue', val);
  if (val.length === props.length) {
    emit('complete', val);
  }
};

const handleInput = (e, index) => {
  let val = e.target.value;
  // Keep only the last typed character in case they type fast or it didn't clear
  val = val.replace(/[^0-9]/g, '').slice(-1);
  digits.value[index] = val;
  triggerUpdate();

  if (val !== '' && index < props.length - 1) {
    focusInput(index + 1);
  }
};

const handleKeydown = (e, index) => {
  if (e.key === 'Backspace') {
    if (digits.value[index] === '') {
      // If current is empty, go to previous and clear it
      if (index > 0) {
        digits.value[index - 1] = '';
        triggerUpdate();
        focusInput(index - 1);
      }
    } else {
      // Clear current
      digits.value[index] = '';
      triggerUpdate();
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (index > 0) focusInput(index - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (index < props.length - 1) focusInput(index + 1);
  }
};

const handlePaste = (e) => {
  e.preventDefault();
  const pastedData = e.clipboardData
    .getData('text')
    .replace(/[^0-9]/g, '')
    .slice(0, props.length);
  if (!pastedData) return;

  const chars = pastedData.split('');
  for (let i = 0; i < props.length; i++) {
    digits.value[i] = chars[i] || '';
  }

  triggerUpdate();

  // Focus next empty or last
  const nextEmpty = digits.value.findIndex((d) => d === '');
  if (nextEmpty !== -1) {
    focusInput(nextEmpty);
  } else {
    focusInput(props.length - 1);
  }
};

defineExpose({
  focus: () => focusInput(0)
});
</script>

<template>
  <div class="flex gap-4 justify-center" @paste="handlePaste">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      :ref="
        (el) => {
          if (el) inputs[index] = el;
        }
      "
      :value="digit"
      type="text"
      inputmode="numeric"
      :disabled="disabled"
      @input="(e) => handleInput(e, index)"
      @keydown="(e) => handleKeydown(e, index)"
      :class="['input-field text-center text-2xl font-bold w-12 h-14 p-0', { 'input-field--error': error }]"
    />
  </div>
</template>

<style scoped>
/* Remove arrows/spinners from number inputs if used */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
