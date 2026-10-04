<script setup>
import { ref, computed, watch } from 'vue';
import { Pencil } from '@lucide/vue';
import TextInput from '@shared/components/form/TextInput.vue';
import SelectInput from '@shared/components/form/SelectInput.vue';
import DatePicker from '@shared/components/form/DatePicker.vue';
import TextareaInput from '@shared/components/form/TextareaInput.vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' }, // text | date | url | tel | textarea | select
  options: { type: Array, default: () => [] },
  isMe: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  emptyText: { type: String, default: null }
});

const emit = defineEmits(['save']);

const editing = ref(false);
const draft = ref('');

const startEdit = () => {
  // DatePicker espera DD-MM-AAAA, el backend guarda YYYY-MM-DD — convertimos
  if (props.type === 'date' && props.value) {
    const [y, m, d] = props.value.split('-');
    draft.value = d && m && y ? `${d}-${m}-${y}` : props.value;
  } else {
    draft.value = props.value || '';
  }
  editing.value = true;
};

const cancel = () => {
  editing.value = false;
  draft.value = '';
};

const confirm = () => {
  let val = draft.value;
  // Convertir DD-MM-AAAA → YYYY-MM-DD para el backend
  if (props.type === 'date' && val) {
    const [d, m, y] = val.split('-');
    val = d && m && y ? `${y}-${m}-${d}` : val;
  }
  emit('save', val);
  editing.value = false;
};

// Cuando el padre actualiza el valor, cerramos 
watch(
  () => props.value,
  () => {
    if (editing.value) editing.value = false;
  }
);

// Texto de 
const displayValue = computed(() => {
  const v = props.value;
  if (!v) return null;
  if (props.type === 'date') {
    const [y, m, d] = v.split('-').map(Number);
    if (!y || !m || !d) return v;
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  if (props.type === 'select') {
    const found = props.options.find((o) => o.value === v);
    return found ? found.label : v;
  }
  return v;
});
</script>

<template>
  <div class="group py-4 border-b border-border last:border-0">
    <!-- Modo  -->
    <div v-if="!editing" class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-text-muted mb-1">{{ label }}</p>
        <a
          v-if="type === 'url' && displayValue"
          :href="value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-brand hover:underline break-all"
        >
          {{ displayValue }}
        </a>
        <p v-else-if="displayValue" class="text-sm text-text-primary">
          {{ displayValue }}
        </p>
        <p v-else class="text-sm text-text-muted italic">
          {{ emptyText || `Sin ${label.toLowerCase()}` }}
        </p>
      </div>

      <button
        v-if="isMe"
        type="button"
        class="shrink-0 mt-0.5 p-1.5 rounded-full text-text-muted hover:text-brand hover:bg-green-50 dark:hover:bg-green-950/30 border-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
        :title="`Editar ${label}`"
        @click="startEdit"
      >
        <Pencil :size="15" />
      </button>
    </div>

    <!-- Modo  -->
    <div v-else class="space-y-3">
      <p class="text-xs font-medium text-text-muted">{{ label }}</p>

      <!-- Textarea -->
      <TextareaInput
        v-if="type === 'textarea'"
        v-model="draft"
        :rows="3"
        :placeholder="placeholder"
        class="w-full"
      />

      <!-- Select -->
      <SelectInput
        v-else-if="type === 'select'"
        v-model="draft"
        :options="options"
        :placeholder="placeholder || 'Seleccionar…'"
        class="w-full"
      />

      <!-- DatePicker -->
      <DatePicker
        v-else-if="type === 'date'"
        v-model="draft"
        :disable-future-dates="false"
        :clearable="true"
        class="w-full"
      />

      <!-- TextInput genérico (text, url, tel) -->
      <TextInput
        v-else
        v-model="draft"
        :type="type"
        :placeholder="placeholder"
        class="w-full"
        @keydown.enter="confirm"
        @keydown.esc="cancel"
      />

      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-alt hover:bg-border rounded-lg border-0 cursor-pointer transition-colors"
          @click="cancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg border-0 cursor-pointer transition-colors disabled:opacity-50"
          :disabled="saving"
          @click="confirm"
        >
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>
