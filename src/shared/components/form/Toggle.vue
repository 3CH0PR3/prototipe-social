<script setup>
import { computed } from 'vue';

const props = defineProps({
  checked: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:checked']);

const onToggle = (e) => {
  if (!props.disabled) emit('update:checked', e.target.checked);
};
</script>

<template>
  <label
    class="flex items-center gap-3 cursor-pointer select-none"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div class="relative flex items-center">
      <input type="checkbox" :checked="checked" @change="onToggle" class="sr-only" :disabled="disabled" />
      <div
        class="block h-6 w-11 rounded-full transition-colors duration-200 ease-in-out"
        :class="checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'"
      ></div>
      <div
        class="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
        :class="checked ? 'translate-x-[20px]' : 'translate-x-0'"
      ></div>
    </div>
    <span v-if="label" class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ label }}</span>
  </label>
</template>
