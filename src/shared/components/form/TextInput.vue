<script setup>
import { computed, onMounted, ref, useAttrs } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  inputClass: { type: String, default: '' },
  hint: { type: String, default: '' },
  maxLength: { type: Number, default: null },

  // Filtros de entrada
  lettersOnly: { type: Boolean, default: false },
  numbersOnly: { type: Boolean, default: false },
  allowDecimal: { type: Boolean, default: false },
  decimalOneDigit: { type: Boolean, default: false },
  allowSpaces: { type: Boolean, default: true },
  allowAccents: { type: Boolean, default: true },
  allowNegative: { type: Boolean, default: false },
  allowHyphen: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const inputRef = ref(null);
const attrs = useAttrs();

const inputClasses = computed(() => ['input-field', props.inputClass, { 'input-field--error': props.error }]);

// ---- Helpers de limpieza ----

const cleanLetters = (value) => {
  let pattern = 'a-zA-Z';
  if (props.allowAccents) pattern += 'áéíóúÁÉÍÓÚñÑ';
  if (props.allowSpaces) pattern += '\\s';
  if (props.allowHyphen) pattern += '-';

  value = value.replace(new RegExp(`[^${pattern}]`, 'g'), '');

  if (props.allowHyphen) {
    const parts = value.split('-');
    if (parts.length > 2) value = parts[0] + '-' + parts.slice(1).join('').replace(/-/g, '');
  }

  return value;
};

const cleanNumbers = (value) => {
  let allowed = '0-9';
  if (props.allowDecimal) allowed += '\\.';
  if (props.allowNegative) allowed += '-';

  value = value.replace(new RegExp(`[^${allowed}]`, 'g'), '');

  if (props.allowDecimal) {
    const parts = value.split('.');
    if (parts.length > 2) value = parts.shift() + '.' + parts.join('');
  }

  return value;
};

const cleanDecimalOneDigit = (value) => {
  let negative = '';
  if (props.allowNegative && value.startsWith('-')) {
    negative = '-';
    value = value.slice(1);
  }

  value = value.replace(/[^0-9.]/g, '');
  const parts = value.split('.');

  if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
  if (parts[1]?.length > 1) value = parts[0] + '.' + parts[1].slice(0, 1);

  return negative + value;
};

// ---- Eventos ----

const handleKeydown = (e) => {
  const navKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Home',
    'End',
    'Enter'
  ];
  if (navKeys.includes(e.key)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Bloquear punto/coma duplicado en decimales
  if (props.numbersOnly && props.allowDecimal) {
    if ((e.key === '.' || e.key === ',') && inputRef.value?.value.includes('.')) {
      e.preventDefault();
      return;
    }
  }

  // Bloquear guion negativo si no está permitido
  if (props.numbersOnly && !props.allowNegative && e.key === '-') {
    e.preventDefault();
  }
};

const handleInput = (e) => {
  let value = e.target.value;
  value = value.replace(',', '.');

  if (props.lettersOnly) value = cleanLetters(value);
  if (props.numbersOnly) {
    value = cleanNumbers(value);
    if (props.decimalOneDigit) value = cleanDecimalOneDigit(value);
  }
  if (props.maxLength) value = value.slice(0, props.maxLength);

  if (value !== e.target.value) e.target.value = value;

  emit('update:modelValue', value);
};

onMounted(() => {
  if (inputRef.value?.hasAttribute('autofocus')) inputRef.value.focus();
});

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<template>
  <input
    ref="inputRef"
    v-bind="attrs"
    :value="modelValue"
    :disabled="disabled"
    :readonly="readonly"
    :class="inputClasses"
    @keydown="handleKeydown"
    @input="handleInput"
  />
  <small v-if="hint" class="mt-0 text-[10px] text-slate-950/50 dark:text-slate-50">{{ hint }}</small>

  <template v-if="false">
    <TextInput v-model="form.numacro" :numbers-only="true" />
    <!-- Solo números -->
    <TextInput v-model="form.price" :numbers-only="true" :allow-decimal="true" />
    <!-- Solo números con decimales -->
    <TextInput v-model="form.temp" :numbers-only="true" :decimal-one-digit="true" :allow-negative="true" />
    <!-- Solo números, un decimal, negativo permitido -->
    <TextInput v-model="form.code" :letters-only="true" :allow-spaces="false" />
    <!-- Solo letras, sin espacios -->
    <TextInput v-model="form.name" :letters-only="true" :allow-hyphen="true" />
    <!-- Solo letras con guion (ej: nombres compuestos) -->
    <TextInput v-model="form.nuap" :max-length="10" />
    <!-- Máximo caracteres -->
  </template>
</template>
