<script setup>
import { useCurrency } from '@js/Composables/useCurrency';

defineProps({
  rows: {
    type: Array,
    default: () => []
    // { label, value, highlight?, negative? }
  },
  totalLabel: { type: String, default: 'Total' },
  totalValue: { type: [Number, String], default: 0 },
  totalHighlight: { type: Boolean, default: true }
});

const { formatCurrency } = useCurrency();

const formatVal = (val, negative, prefix = '') => {
  const formatted = formatCurrency(val);
  if (prefix) return `${prefix}${formatted}`;
  return negative ? `- ${formatted}` : formatted;
};
</script>

<template>
  <div class="form-summary">
    <div v-for="(row, i) in rows" :key="i" class="flex justify-between font-semibold">
      <span class="text-slate-500">{{ row.label }}</span>
      <span
        :class="
          row.negative
            ? 'text-rose-500'
            : row.highlight
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-800 dark:text-slate-200'
        "
      >
        {{ formatVal(row.value, row.negative, row.prefix) }}
      </span>
    </div>
    <div class="flex justify-between border-t border-slate-200 pt-2 text-sm font-black dark:border-slate-800">
      <span class="text-slate-800 dark:text-slate-200">{{ totalLabel }}</span>
      <span
        :class="totalHighlight ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'"
      >
        {{ formatCurrency(totalValue) }}
      </span>
    </div>
  </div>
</template>
