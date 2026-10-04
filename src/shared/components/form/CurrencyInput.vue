<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: 'amount' },
  placeholder: { type: String, default: 'Mínimo 1,000' },
  min: { type: [String, Number], default: undefined }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="relative">
    <span
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-500 dark:text-slate-400"
    >
      $
    </span>
    <input
      :id="id"
      type="number"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :min="min"
      :class="[
        'input-field pl-8 pr-14 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        { 'input-field--error': error }
      ]"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <span
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-400"
    >
      COP
    </span>
  </div>
</template>
