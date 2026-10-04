<script setup>
import { useCurrency } from '@js/Composables/useCurrency';

const props = defineProps({
  amounts: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' }
});

const emit = defineEmits(['update:modelValue']);

const { formatCurrency } = useCurrency();

const select = (amt) => emit('update:modelValue', amt);
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
    <button
      v-for="amt in amounts"
      :key="amt"
      type="button"
      class="rounded border py-2.5 text-center text-xs font-bold transition"
      :class="
        Number(modelValue) === amt
          ? 'border-brand-500 bg-brand-500 text-slate-950 shadow-md'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-950'
      "
      @click="select(amt)"
    >
      {{ formatCurrency(amt).replace(',00', '') }}
    </button>
  </div>
</template>
