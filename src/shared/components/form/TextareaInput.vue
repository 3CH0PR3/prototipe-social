<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
  id: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <textarea
    :id="id"
    :rows="rows"
    :value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :class="['textarea-field scroll-m-0', { 'input-field--error': error }]"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
