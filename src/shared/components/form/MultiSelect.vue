<script setup>
/**
 * MultiSelect — select con multi-selección, tags y búsqueda integrada.
 *
 * Props:
 *   modelValue        Array<string|number>   — valores seleccionados
 *   options           Array<{ value, label, disabled? }>
 *   placeholder       string
 *   searchPlaceholder string
 *   disabled          boolean
 *   loading           boolean
 *   error             boolean
 *   noResultsText     string
 *   maxSelected       number | null  — límite de selecciones (null = sin límite)
 *
 * Emits: update:modelValue
 */
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Search, X, Check } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Seleccione opciones' },
  searchPlaceholder: { type: String, default: 'Buscar...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  noResultsText: { type: String, default: 'Sin resultados' },
  maxSelected: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue']);

// ── Estado ────────────────────────────────────────────────────────────────────
const isOpen = ref(false);
const query = ref('');
const openUpward = ref(false);
const containerRef = ref(null);
const searchRef = ref(null);
const listRef = ref(null);
const focusedIndex = ref(-1);

// ── Computadas ────────────────────────────────────────────────────────────────
const selected = computed(() => props.modelValue ?? []);

const selectedLabels = computed(() =>
  selected.value.map((v) => props.options.find((o) => String(o.value) === String(v))?.label ?? String(v))
);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => String(o.label).toLowerCase().includes(q));
});

const isSelected = (value) => selected.value.some((v) => String(v) === String(value));

const reachedMax = computed(() => props.maxSelected !== null && selected.value.length >= props.maxSelected);

// Resaltar texto buscado
const highlight = (label) => {
  const q = query.value.trim();
  if (!q) return label;
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return label;
  return (
    label.slice(0, idx) + `<mark>${label.slice(idx, idx + q.length)}</mark>` + label.slice(idx + q.length)
  );
};

// ── Dropdown ──────────────────────────────────────────────────────────────────
const open = async () => {
  if (props.disabled || props.loading) return;
  isOpen.value = true;
  query.value = '';
  focusedIndex.value = -1;

  const rect = containerRef.value?.getBoundingClientRect();
  openUpward.value = window.innerHeight - (rect?.bottom ?? 0) < 320;

  await nextTick();
  searchRef.value?.focus();
};

const close = () => {
  isOpen.value = false;
  query.value = '';
  focusedIndex.value = -1;
};

const toggle = () => (isOpen.value ? close() : open());

// ── Selección ─────────────────────────────────────────────────────────────────
const toggle_item = (value) => {
  if (props.disabled) return;
  const strVal = String(value);
  const current = selected.value.map(String);

  if (current.includes(strVal)) {
    // Deseleccionar
    emit(
      'update:modelValue',
      selected.value.filter((v) => String(v) !== strVal)
    );
  } else {
    // Seleccionar — respetar maxSelected
    if (reachedMax.value) return;
    emit('update:modelValue', [...selected.value, value]);
  }
  // Mantiene el dropdown abierto para multi-selección fluida
};

const removeTag = (value, e) => {
  e?.stopPropagation();
  emit(
    'update:modelValue',
    selected.value.filter((v) => String(v) !== String(value))
  );
};

const clearAll = (e) => {
  e?.stopPropagation();
  emit('update:modelValue', []);
};

// ── Teclado ───────────────────────────────────────────────────────────────────
const scrollFocused = async () => {
  await nextTick();
  listRef.value?.querySelector('[data-focused="true"]')?.scrollIntoView({ block: 'nearest' });
};

watch(query, () => {
  focusedIndex.value = filtered.value.length > 0 ? 0 : -1;
  nextTick(() => {
    listRef.value?.querySelector('[data-focused="true"]')?.scrollIntoView({ block: 'nearest' });
  });
});

const onKeydown = (e) => {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
    return;
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      focusedIndex.value = Math.min(focusedIndex.value + 1, filtered.value.length - 1);
      scrollFocused();
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
      scrollFocused();
      break;
    case 'Enter':
      e.preventDefault();
      if (focusedIndex.value >= 0 && filtered.value[focusedIndex.value]) {
        toggle_item(filtered.value[focusedIndex.value].value);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      break;
    case 'Backspace':
      if (!query.value && selected.value.length) {
        // Elimina el último tag con Backspace si el input está vacío
        emit('update:modelValue', selected.value.slice(0, -1));
      }
      break;
  }
};

// ── Click outside ─────────────────────────────────────────────────────────────
const onOutsideClick = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) close();
};

onMounted(() => document.addEventListener('mousedown', onOutsideClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick));
</script>

<template>
  <div ref="containerRef" class="relative w-full" @keydown="onKeydown">
    <!-- ── Trigger / Tags ──────────────────────────────────────────────────── -->
    <div
      :class="[
        'flex min-h-[2.5rem] w-full items-center rounded border px-2.5 py-1.5 text-sm transition-colors cursor-pointer',
        disabled || loading
          ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40'
          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40',
        isOpen ? 'border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-500' : '',
        error && !isOpen ? 'border-rose-400 ring-1 ring-rose-400/30 dark:border-rose-500' : ''
      ]"
      @click="toggle"
    >
      <!-- Contenedor de Tags -->
      <div class="flex flex-1 flex-wrap items-center gap-1.5">
        <!-- Tags seleccionados -->
        <template v-if="selected.length">
          <span
            v-for="(label, i) in selectedLabels"
            :key="selected[i]"
            class="inline-flex items-center rounded-md bg-brand-100 pl-2.5 pr-1 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
            @click.stop
          >
            <span>{{ label }}</span>
            <button
              type="button"
              :disabled="disabled"
              class="ml-1.5 inline-flex items-center justify-center rounded-[4px] p-0.5 text-brand-500 hover:bg-brand-200 hover:text-brand-800 transition-colors focus:outline-none dark:text-brand-400 dark:hover:bg-brand-500/40 dark:hover:text-brand-100 disabled:opacity-40"
              @click="removeTag(selected[i], $event)"
            >
              <X class="h-3 w-3" />
            </button>
          </span>
        </template>

        <!-- Placeholder -->
        <span v-else class="text-slate-500 dark:text-slate-400 select-none">
          <template v-if="loading">Cargando...</template>
          <template v-else>{{ placeholder }}</template>
        </span>
      </div>

      <!-- Acciones: clear-all + chevron -->
      <span class="ml-2 flex shrink-0 items-center gap-1" @click.stop>
        <button
          v-if="selected.length && !disabled"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          @click="clearAll"
        >
          <X class="h-4 w-4" />
        </button>
        <ChevronDown
          :class="[
            'h-4 w-4 text-slate-400 transition-transform duration-150 dark:text-slate-500',
            { 'rotate-180': isOpen }
          ]"
        />
      </span>
    </div>

    <!-- ── Dropdown ───────────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 w-full min-w-[12rem] rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
        :class="openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'"
      >
        <!-- Buscador -->
        <div class="border-b border-slate-100 p-2 dark:border-slate-800">
          <div class="relative">
            <Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              ref="searchRef"
              v-model="query"
              type="text"
              :placeholder="searchPlaceholder"
              class="input-field !py-1.5 !pl-8 !text-xs"
              @click.stop
              @keydown.stop="onKeydown"
            />
          </div>
          <!-- Contador de seleccionados -->
          <p v-if="selected.length" class="mt-1 px-1 text-[11px] text-slate-400 dark:text-slate-500">
            {{ selected.length }} seleccionado{{ selected.length !== 1 ? 's' : '' }}
            <template v-if="maxSelected">de {{ maxSelected }}</template>
          </p>
        </div>

        <!-- Lista -->
        <ul ref="listRef" class="max-h-56 overflow-y-auto overscroll-contain py-1">
          <li
            v-if="filtered.length === 0"
            class="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500"
          >
            {{ noResultsText }}
          </li>

          <li
            v-for="(opt, i) in filtered"
            :key="opt.value"
            :data-focused="i === focusedIndex ? 'true' : 'false'"
            class="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors select-none"
            :class="[
              opt.disabled || (reachedMax && !isSelected(opt.value))
                ? 'cursor-default text-slate-400 dark:text-slate-500 italic'
                : isSelected(opt.value)
                  ? 'cursor-pointer bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : i === focusedIndex
                    ? 'cursor-pointer bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    : 'cursor-pointer text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
            ]"
            @mouseenter="!opt.disabled && (focusedIndex = i)"
            @click.stop="!(opt.disabled || (reachedMax && !isSelected(opt.value))) && toggle_item(opt.value)"
          >
            <!-- Checkbox visual -->
            <span
              :class="[
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                isSelected(opt.value)
                  ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
                  : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
              ]"
            >
              <Check v-if="isSelected(opt.value)" class="h-2.5 w-2.5 text-white" />
            </span>

            <span class="truncate" v-html="highlight(opt.label)" />
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
:deep(mark) {
  background-color: transparent;
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgb(var(--color-brand));
  text-underline-offset: 2px;
}
</style>
