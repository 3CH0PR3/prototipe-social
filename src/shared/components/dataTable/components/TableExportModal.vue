<script setup>
import { ref } from 'vue';
import { Download, FileSpreadsheet, FileText, FileType, TableIcon } from '@lucide/vue';
import Modal from '@shared/components/modals/Modal.vue';

const emit = defineEmits(['export', 'close']);

const modalRef = ref(null);
const selected = ref(null);

const formats = [
  {
    key: 'csv',
    label: 'CSV',
    desc: 'Compatible con Excel y Google Sheets',
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20'
  },
  {
    key: 'excel',
    label: 'Excel',
    desc: 'Archivo .xlsx con formato',
    icon: TableIcon,
    color: 'text-teal-600',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20'
  },
  {
    key: 'pdf',
    label: 'PDF',
    desc: 'Documento listo para imprimir',
    icon: FileText,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20'
  },
  {
    key: 'word',
    label: 'Word',
    desc: 'Documento editable .docx',
    icon: FileType,
    color: 'text-brand-500',
    bg: 'bg-brand-500/10 dark:bg-brand-500/20'
  }
];

const open = () => {
  selected.value = null;
  modalRef.value?.open();
};
const onClosed = () => {
  selected.value = null;
  emit('close');
};

const handleExport = () => {
  if (!selected.value) return;
  emit('export', selected.value);
  modalRef.value?.close();
};

defineExpose({ open });
</script>

<template>
  <Modal
    id="table-export"
    ref="modalRef"
    size="modal-md"
    body-class="px-5"
    footer-class="px-5"
    :centered="true"
    @closed="onClosed"
  >
    <template #header>
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-500/20">
          <Download class="h-4 w-4 text-brand-500" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">Exportar datos</h2>
          <p class="text-xs text-slate-400 dark:text-slate-300">Selecciona el formato de descarga</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          v-for="fmt in formats"
          :key="fmt.key"
          :class="[
            'flex flex-col items-center gap-2.5 rounded-xl border-2 px-3 py-4 transition-all duration-150',
            selected === fmt.key
              ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
          ]"
          @click="selected = fmt.key"
        >
          <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', fmt.bg]">
            <component :is="fmt.icon" :class="['h-5 w-5', fmt.color]" />
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ fmt.label }}
            </p>
            <p class="mt-0.5 text-[10px] leading-tight text-slate-400 dark:text-slate-500">
              {{ fmt.desc }}
            </p>
          </div>
        </button>
      </div>
    </template>

    <template #footer>
      <button
        :class="['btn-primary', !selected && 'opacity-50 cursor-not-allowed']"
        :disabled="!selected"
        @click="handleExport"
      >
        <Download class="h-4 w-4" />
        {{ selected ? `Descargar ${selected.toUpperCase()}` : 'Selecciona un formato' }}
      </button>
    </template>
  </Modal>
</template>
