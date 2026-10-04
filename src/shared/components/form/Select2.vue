<script setup>
import { computed, watch, nextTick, ref, onMounted } from 'vue';
import Select2 from 'vue3-select2-component';
import '@styles/components/select2/select2.css';

const props = defineProps({
  id: String,
  name: String,
  modelValue: [String, Number, Array],
  options: Array,
  multiple: Boolean,
  placeholder: String,
  disabled: { type: Boolean, default: false },
  searchable: { type: Boolean },
  ajax: { type: Boolean, default: false },
  ajaxUrl: { type: String, default: null },
  ajaxDelay: { type: Number, default: 250 },
  minimumInputLength: { type: Number, default: 3 },
  processResults: { type: Function, default: null },
  ajaxData: { type: Function, default: null },
  ajaxParams: { type: Object, default: () => ({}) },
  initialOption: { type: Object, default: null },
  error: Boolean,
  isLoading: { type: Boolean, default: false },
  msgResults: { type: String, default: 'No se encontraron resultados' }
});

const wrapperRef = ref(null);
const emit = defineEmits(['update:modelValue', 'change', 'select']);

const handleChange = (value) => {
  if (value === null || value === undefined) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }

  const val = typeof value === 'object' ? value.id : value;
  emit('update:modelValue', val);
  emit('change', val);
};

const settings = computed(() => {
  const baseConfig = {
    width: '100%',
    allowClear: true,
    minimumResultsForSearch: props.searchable === 1 ? Infinity : 0,
    placeholder: props.isLoading ? 'Cargando...' : props.placeholder || 'Seleccione una opción',
    language: {
      noResults: () => props.msgResults,
      searching: () => 'Cargando...',
      inputTooShort: () => `Ingrese al menos ${props.minimumInputLength} caracteres`,
      errorLoading: () => 'No se pudieron cargar los resultados'
    }
  };

  if (props.ajax && props.ajaxUrl) {
    baseConfig.ajax = {
      url: props.ajaxUrl,
      dataType: 'json',
      delay: props.ajaxDelay,
      data: (params) => {
        const baseParams = {
          search: params.term,
          page: params.page || 1,
          ...props.ajaxParams // Agregar parámetros adicionales
        };
        return props.ajaxData ? props.ajaxData(baseParams) : baseParams;
      },
      processResults: (data, params) => {
        params.page = params.page || 1;
        if (props.processResults) return props.processResults(data, params);

        const results = data.data || data.results || data;
        return {
          results: results.map((item) => ({
            id: item.id,
            text: item.text || item.name || item.label
          })),
          pagination: {
            more: data.next_page_url !== null || params.page * 10 < (data.total || results.length)
          }
        };
      },
      cache: true
    };
    baseConfig.minimumInputLength = props.minimumInputLength;
  }

  return baseConfig;
});

const initialOptions = computed(() => {
  if (props.ajax && props.initialOption) {
    return [{ id: props.initialOption.id, text: props.initialOption.text }];
  }
  return props.options || [];
});

watch(
  () => !!props.error,
  async (val) => {
    await nextTick();
    const container = wrapperRef.value?.querySelector('.select2-hidden-accessible');
    if (container) {
      container.classList.toggle('is-invalid', val);
    }
  }
);
</script>

<template>
  <div ref="wrapperRef">
    <Select2
      class="z-n1"
      :key="isLoading"
      :model-value="modelValue"
      :options="initialOptions"
      :settings="settings"
      :disabled="disabled || isLoading"
      @update:modelValue="handleChange"
    />
  </div>
</template>
