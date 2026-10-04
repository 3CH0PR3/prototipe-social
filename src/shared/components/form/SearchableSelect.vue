<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, Check, Search, X } from '@lucide/vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Seleccionar' },
  searchPlaceholder: { type: String, default: 'Buscar...' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  width: { type: String, default: 'w-full' },
  noResultsText: { type: String, default: 'Sin resultados' },
  clearable: { type: Boolean, default: true },
  error: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'search']);

const isOpen = ref(false);
const query = ref('');
const openUpward = ref(false);
const containerRef = ref(null);
const searchRef = ref(null);
const listRef = ref(null);
const focusedIndex = ref(-1);

const isPlaceholder = computed(
  () => props.modelValue === '' || props.modelValue === null || props.modelValue === undefined
);

const selectedLabel = computed(() => {
  const found = props.options.find((o) => String(o.value) === String(props.modelValue));
  return found?.label ?? props.placeholder;
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter((o) => String(o.label).toLowerCase().includes(q));
});

// Resaltar la parte del texto que coincide con la búsqueda
const highlight = (label) => {
  const q = query.value.trim();
  if (!q) return label;
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return label;
  return (
    label.slice(0, idx) + `<mark>${label.slice(idx, idx + q.length)}</mark>` + label.slice(idx + q.length)
  );
};

const open = async () => {
  if (props.disabled || props.loading) return;
  isOpen.value = true;
  query.value = '';
  focusedIndex.value = -1;

  // Detectar si hay espacio debajo — dropdown mide ~280px
  const rect = containerRef.value?.getBoundingClientRect();
  openUpward.value = window.innerHeight - (rect?.bottom ?? 0) < 300;

  await nextTick();
  searchRef.value?.focus();
  await nextTick();
  scrollToSelected();
};

const close = () => {
  isOpen.value = false;
  query.value = '';
  focusedIndex.value = -1;
};

const toggle = () => (isOpen.value ? close() : open());

// ── Selección ─────────────────────────────────────────────────────────────────

const select = (value) => {
  emit('update:modelValue', value);
  close();
};

const clear = (e) => {
  e.stopPropagation();
  emit('update:modelValue', '');
};

// ── Scroll ────────────────────────────────────────────────────────────────────

/** Cuando abre: centra el item seleccionado en la lista */
const scrollToSelected = () => {
  const list = listRef.value;
  if (!list) return;
  const el = list.querySelector('[data-selected="true"]');
  if (!el) return;
  // Centrar verticalmente en la lista
  list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2;
};

/** Al navegar con teclado: mantiene el item focused visible */
const scrollFocused = async () => {
  await nextTick();
  listRef.value?.querySelector('[data-focused="true"]')?.scrollIntoView({ block: 'nearest' });
};

// ── Al cambiar query: actualizar focusedIndex al primer match del seleccionado ─

watch(query, (val) => {
  emit('search', val);
  const selIdx = filtered.value.findIndex((o) => String(o.value) === String(props.modelValue));
  focusedIndex.value = selIdx >= 0 ? selIdx : filtered.value.length > 0 ? 0 : -1;
  nextTick(() => {
    listRef.value?.querySelector('[data-focused="true"]')?.scrollIntoView({ block: 'nearest' });
  });
});

// ── Teclado ───────────────────────────────────────────────────────────────────

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
        select(filtered.value[focusedIndex.value].value);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      break;
  }
};

const onOutsideClick = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) close();
};

onMounted(() => document.addEventListener('mousedown', onOutsideClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick));
</script>

<template>
  <div ref="containerRef" class="relative" :class="width" @keydown="onKeydown">
    <!-- ── Trigger ──────────────────────────────────────────────────────────── -->
    <button
      type="button"
      :disabled="disabled || loading"
      class="flex h-10 w-full items-center justify-between gap-2 rounded border px-3 text-sm transition-colors"
      :class="[
        disabled || loading
          ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40'
          : 'cursor-pointer border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40',
        isOpen ? 'border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-500' : '',
        error ? 'select-trigger--error' : ''
      ]"
      @click="toggle"
    >
      <span
        class="truncate text-left"
        :class="isPlaceholder ? 'text-slate-400 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'"
      >
        <template v-if="loading">Cargando...</template>
        <template v-else>{{ selectedLabel }}</template>
      </span>

      <span class="flex shrink-0 items-center gap-1">
        <span
          v-if="clearable && !isPlaceholder && !disabled"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          @click.stop="clear"
        >
          <X class="h-3.5 w-3.5" />
        </span>
        <ChevronDown
          :class="[
            'h-4 w-4 text-slate-400 transition-transform duration-150 dark:text-slate-400',
            { 'rotate-180': isOpen }
          ]"
        />
      </span>
    </button>

    <!-- ── Dropdown ──────────────────────────────────────────────────────────── -->
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
              @keydown.stop="onKeydown"
            />
          </div>
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
            :data-selected="String(modelValue) === String(opt.value) ? 'true' : 'false'"
            :data-focused="i === focusedIndex ? 'true' : 'false'"
            class="flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors"
            :class="[
              opt.disabled
                ? 'cursor-default text-slate-400 dark:text-slate-500 italic'
                : String(modelValue) === String(opt.value)
                  ? 'cursor-pointer bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : i === focusedIndex
                    ? 'cursor-pointer bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    : 'cursor-pointer text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
            ]"
            @mouseenter="!opt.disabled && (focusedIndex = i)"
            @click="!opt.disabled && select(opt.value)"
          >
            <span class="truncate" v-html="highlight(opt.label)" />
            <Check
              v-if="String(modelValue) === String(opt.value) && !opt.disabled"
              class="h-3.5 w-3.5 shrink-0 text-brand-500"
            />
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Highlight del texto buscado */
:deep(mark) {
  background-color: transparent;
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgb(var(--color-brand));
  text-underline-offset: 2px;
}
</style>
