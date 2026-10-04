<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    :disabled="disabled"
    :class="['select-field', { 'input-field--error': error }]"
    @change="emit('update:modelValue', $event.target.value)"
  >
    <option v-if="placeholder" disabled value="">
      {{ placeholder }}
    </option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
