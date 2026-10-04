<script setup>
import { useCurrency } from '@js/Composables/useCurrency';

defineProps({
  balance: { type: [Number, String], default: 0 },
  balanceLabel: { type: String, default: 'Saldo disponible' },
  secondaryValue: { type: [Number, String], default: null },
  secondaryLabel: { type: String, default: '' },
  badge: { type: String, default: '' }
});

const { formatCurrency } = useCurrency();
</script>

<template>
  <div
    class="mb-6 flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
  >
    <div>
      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {{ balanceLabel }}
      </p>
      <p class="text-lg font-black text-slate-800 dark:text-slate-200">
        {{ formatCurrency(balance) }}
      </p>
    </div>
    <div v-if="secondaryLabel" class="text-right">
      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {{ secondaryLabel }}
      </p>
      <p class="text-sm font-black text-slate-700 dark:text-slate-300">
        {{ formatCurrency(secondaryValue) }}
      </p>
    </div>
    <span
      v-else-if="badge"
      class="rounded-xl bg-brand-100 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
    >
      {{ badge }}
    </span>
  </div>
</template>
