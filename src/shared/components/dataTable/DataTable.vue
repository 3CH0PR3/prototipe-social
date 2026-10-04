<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Search,
  X,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  SlidersHorizontal,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from '@lucide/vue';
import TableFilters from './components/TableFilters.vue';
import TableFilterDrawer from './components/TableFilterDrawer.vue';
import TableExportModal from './components/TableExportModal.vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  actions: {
    type: [Array, Function],
    default: () => ['view', 'edit', 'delete']
  },
  searchable: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  noExport: { type: Boolean, default: true },
  serverSide: { type: Boolean, default: true },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  totalRecords: { type: Number, default: 0 },
  perPage: { type: Number, default: 10 },
  showSkeleton: { type: Boolean, default: true },
  showApsFilters: { type: Boolean, default: false },
  showDateFilters: { type: Boolean, default: false },
  showLocationFilters: { type: Boolean, default: false },
  departments: { type: Array, default: () => [] },
  municipalities: { type: Array, default: () => [] },
  initialSearch: { type: String, default: '' },
  apsList: { type: Array, default: () => [] },
  defaultCurrentDate: { type: Boolean, default: false }
});

const emit = defineEmits(['edit', 'delete', 'view', 'page-change', 'search', 'filter-change', 'export', 'sort']);

const getRowActions = (row) =>
  typeof props.actions === 'function'
    ? props.actions(row)
    : Array.isArray(props.actions)
      ? props.actions
      : [];

const hasActionColumn = computed(() => {
  if (typeof props.actions === 'function') {
    // Evalúa sobre los datos actuales — si alguna fila tiene edit o delete, muestra la columna
    return props.data.some((row) => {
      const a = props.actions(row);
      return a.includes('edit') || a.includes('delete');
    });
  }
  return props.actions.includes('edit') || props.actions.includes('delete');
});

const searchQuery = ref(props.initialSearch);
const localCurrentPage = ref(props.currentPage);
const tableWrapper = ref(null);
const visibleColumns = ref([]);
const hiddenColumns = ref([]);
const expandedRows = ref(new Set());
const tableContainer = ref(null);
const drawerOpen = ref(false);
const exportModalRef = ref(null);

watch(() => props.currentPage, (val) => {
  localCurrentPage.value = val;
});

const sortKey = ref('');
const sortOrder = ref(''); // 'asc' or 'desc'

const handleSort = (key) => {
  const col = getColumn(key);
  if (col?.sortable === false) return;

  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc';
    } else {
      sortKey.value = '';
      sortOrder.value = '';
    }
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  emit('sort', { key: sortKey.value, order: sortOrder.value });
};

const displayData = computed(() => {
  if (props.serverSide) return props.data;

  let processedData = [...props.data];

  if (sortKey.value) {
    processedData.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const modifier = sortOrder.value === 'asc' ? 1 : -1;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * modifier;
      }
      return (valA < valB ? -1 : 1) * modifier;
    });
  }

  const start = (localCurrentPage.value - 1) * props.perPage;
  return processedData.slice(start, start + props.perPage);
});
const computedTotalPages = computed(() =>
  props.serverSide ? Number(props.totalPages) : Math.ceil(props.data.length / props.perPage)
);
const computedTotalRecords = computed(() => (props.serverSide ? props.totalRecords : props.data.length));

const goToPage = (page) => {
  if (page >= 1 && page <= computedTotalPages.value) {
    localCurrentPage.value = page;
    if (props.serverSide) emit('page-change', page);
  }
};

const recalculateColumns = () => {
  if (!tableWrapper.value) return;
  const availableWidth = tableWrapper.value.clientWidth;
  const sorted = [...props.columns].sort((a, b) => (a.priority || 999) - (b.priority || 999));

  let usedWidth = 0;
  const visible = [];
  const hidden = [];
  const EXPAND_BTN = 40; // w-10 en Tailwind
  const ACTIONS_WIDTH = hasActionColumn.value ? 112 : 0; // w-28 en Tailwind
  const CELL_PADDING = 32; // px-4 = 16px * 2

  for (const col of sorted) {
    const colWidth = col.width || 120;
    const expandWidth = hidden.length > 0 ? EXPAND_BTN : 0;
    // Cada columna añade su width + padding
    const columnTotal = colWidth + CELL_PADDING;
    const totalNeeded = usedWidth + columnTotal + expandWidth + ACTIONS_WIDTH + CELL_PADDING;

    // Siempre mostrar al menos 1 columna
    if (totalNeeded <= availableWidth || visible.length === 0) {
      visible.push(col.key);
      usedWidth += columnTotal;
    } else {
      hidden.push(col.key);
    }
  }

  // Restore original visual order
  const originalOrder = props.columns.map((c) => c.key);
  visible.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
  hidden.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));

  if (JSON.stringify(visibleColumns.value) !== JSON.stringify(visible)) {
    visibleColumns.value = visible;
    hiddenColumns.value = hidden;
    expandedRows.value.clear();
  }
};

const toggleExpand = (rowId) => {
  if (expandedRows.value.has(rowId)) expandedRows.value.delete(rowId);
  else expandedRows.value.add(rowId);
};

const getColumn = (key) => props.columns.find((c) => c.key === key);

const debouncedSearch = useDebounceFn((val) => {
  emit('search', val);
  if (!props.serverSide) localCurrentPage.value = 1;
}, 1000);

const handleSearch = () => {
  debouncedSearch(searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

const handleFilterChange = (filters) => emit('filter-change', filters);

const shouldShowPage = (page) => {
  if (page === 1 || page === computedTotalPages.value) return true;
  const isMobile = window.innerWidth < 640;
  if (isMobile) return page === localCurrentPage.value;
  return page >= localCurrentPage.value - 1 && page <= localCurrentPage.value + 1;
};

const shouldShowEllipsis = (page) => {
  const isMobile = window.innerWidth < 640;
  if (isMobile) {
    return (
      (page === 2 && localCurrentPage.value > 2) ||
      (page === computedTotalPages.value - 1 && localCurrentPage.value < computedTotalPages.value - 1)
    );
  }
  return page === localCurrentPage.value - 2 || page === localCurrentPage.value + 2;
};

let resizeObserver = null;
let resizeTimeout = null;

onMounted(() => {
  if (tableWrapper.value) {
    resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(recalculateColumns, 150);
    });
    resizeObserver.observe(tableWrapper.value);
    recalculateColumns();
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  if (resizeTimeout) clearTimeout(resizeTimeout);
});
</script>

<template>
  <TableFilterDrawer
    :show="drawerOpen"
    :show-date-filters="true"
    :show-location-filters="showLocationFilters"
    :departments="departments"
    :municipalities="municipalities"
    :loading="loading"
    @close="drawerOpen = false"
    @filter-change="handleFilterChange"
  >
    <template v-if="$slots['drawer-filters']" #extra-filters>
      <slot name="drawer-filters" />
    </template>
  </TableFilterDrawer>

  <TableExportModal ref="exportModalRef" @export="(fmt) => emit('export', fmt)" />

  <div class="card !rounded-md w-full flex flex-col gap-2 !mt-0 !border-0 p-2">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-auto sm:flex-1">
        <TableFilters
          :show-date-filters="showDateFilters"
          :show-aps-filters="showApsFilters"
          :aps-list="apsList"
          :loading="loading"
          :default-current-date="defaultCurrentDate"
          :per-page="perPage"
          @filter-change="handleFilterChange"
        >
          <template #extra-filters>
            <slot name="extra-filters" />
          </template>
        </TableFilters>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="searchable" class="relative w-full sm:w-40">
          <Search
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            v-model="searchQuery"
            type="search"
            name="table_search_query"
            autocomplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            placeholder="Buscar..."
            class="input-field w-full !pl-9 !rounded"
            :class="searchQuery ? '!pr-8' : ''"
            @input="handleSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            @click="clearSearch"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          v-if="showLocationFilters || $slots['drawer-filters']"
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
            drawerOpen
              ? 'border-brand-400 bg-brand-50 text-brand-500 dark:border-brand-500 dark:bg-brand-500/10'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
          ]"
          title="Filtros avanzados"
          @click="drawerOpen = !drawerOpen"
        >
          <SlidersHorizontal class="h-4 w-4" />
        </button>

        <!-- Exportar -->
        <button v-if="noExport" class="btn-secondary flex" title="Exportar datos" @click="emit('export')">
          <Download class="h-4 w-4 text-slate-500 dark:text-slate-50" />
        </button>
      </div>
    </div>

    <div ref="tableContainer" class="table-container !rounded">
      <div ref="tableWrapper" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-if="hiddenColumns.length > 0" class="w-10 px-3 py-3" />
              <th
                v-for="colKey in visibleColumns"
                :key="colKey"
                :style="getColumn(colKey)?.width ? `width: ${getColumn(colKey).width}px;` : ''"
                class="group select-none"
                :class="{ 'cursor-pointer': getColumn(colKey)?.sortable !== false }"
                @click="getColumn(colKey)?.sortable !== false && handleSort(colKey)"
              >
                <div class="flex items-center justify-center gap-1.5">
                  <span></span>
                  <span>{{ getColumn(colKey)?.label }}</span>
                  <span
                    v-if="getColumn(colKey)?.sortable !== false"
                    class="inline-flex text-slate-400 transition-opacity"
                    :class="[sortKey === colKey ? 'opacity-100 text-brand-500 dark:text-brand-400' : 'opacity-0 group-hover:opacity-50']"
                  >
                    <ArrowUp v-if="sortOrder === 'asc' && sortKey === colKey" class="h-3.5 w-3.5" />
                    <ArrowDown v-else-if="sortOrder === 'desc' && sortKey === colKey" class="h-3.5 w-3.5" />
                    <ArrowUpDown v-else class="h-3.5 w-3.5" />
                  </span>
                </div>
              </th>
              <th
                v-if="hasActionColumn"
                class="w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading skeleton (solo cuando NO hay datos aún) -->
            <template v-if="loading && showSkeleton && displayData.length === 0">
              <tr v-for="i in perPage" :key="`sk-${i}`" class="animate-pulse h-[3.579rem]">
                <td v-if="hiddenColumns.length > 0" class="w-10 px-3 py-3">
                  <div class="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700" />
                </td>
                <td v-for="colKey in visibleColumns" :key="colKey" class="px-4 py-3">
                  <div
                    class="mx-auto h-4 rounded bg-slate-200 dark:bg-slate-700"
                    :style="{
                      width: colKey === visibleColumns[0] ? '70%' : '50%'
                    }"
                  />
                </td>
                <td v-if="hasActionColumn" class="w-24 px-3 py-3">
                  <div class="ml-auto h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                </td>
              </tr>
            </template>

            <!-- Empty -->
            <tr v-else-if="!loading && displayData.length === 0">
              <td
                :colspan="
                  visibleColumns.length + (hiddenColumns.length > 0 ? 1 : 0) + (hasActionColumn ? 1 : 0)
                "
                class="table-empty"
              >
                <slot name="empty"><p>No hay datos disponibles</p></slot>
              </td>
            </tr>

            <!-- Rows -->
            <template v-else>
              <template v-for="(row, index) in displayData" :key="row.id || row.uid || index">
                <!-- Rows -->
                <tr
                  :class="
                    getRowActions(row).includes('view')
                      ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : ''
                  "
                  @click="getRowActions(row).includes('view') && emit('view', row)"
                >
                  <td v-if="hiddenColumns.length > 0" class="w-10 px-3 py-3" @click.stop>
                    <button
                      class="expand-btn"
                      :class="
                        expandedRows.has(row.id || row.uid || index)
                          ? 'expand-btn-active'
                          : 'expand-btn-inactive'
                      "
                      @click="toggleExpand(row.id || row.uid || index)"
                    >
                      <component
                        :is="expandedRows.has(row.id || row.uid || index) ? ChevronDown : ChevronRight"
                        class="h-3.5 w-3.5"
                      />
                    </button>
                  </td>

                  <td v-for="colKey in visibleColumns" :key="colKey">
                    <slot :name="`cell-${colKey}`" :row="row" :value="row[colKey]">{{ row[colKey] }}</slot>
                  </td>

                  <!-- Celda de acciones -->
                  <td v-if="hasActionColumn" class="w-28 px-3 py-2 text-right" @click.stop>
                    <slot name="cell-actions" :row="row">
                      <div class="flex items-center justify-center gap-1.5">
                        <button
                          v-if="getRowActions(row).includes('edit')"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-amber-100 text-amber-600 transition hover:bg-amber-200 hover:text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 dark:hover:text-amber-300"
                          title="Editar"
                          @click="emit('edit', row)"
                        >
                          <PencilIcon class="h-3.5 w-3.5" />
                        </button>
                        <button
                          v-if="getRowActions(row).includes('delete')"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-rose-100 text-rose-600 transition hover:bg-rose-200 hover:text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 dark:hover:text-rose-300"
                          title="Eliminar"
                          @click="emit('delete', row)"
                        >
                          <Trash2Icon class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </slot>
                  </td>
                </tr>

                <!-- Expanded row -->
                <tr
                  v-if="hiddenColumns.length > 0 && expandedRows.has(row.id || row.uid || index)"
                  :key="`expanded-${row.id || row.uid || index}`"
                  class="expanded-row"
                >
                  <td :colspan="visibleColumns.length + 1 + (hasActionColumn ? 1 : 0)" class="px-4 pb-4 pt-2">
                    <div class="expanded-row-content">
                      <div v-for="colKey in hiddenColumns" :key="colKey" class="expanded-row-item">
                        <p class="expanded-row-label">
                          {{ getColumn(colKey)?.label }}
                        </p>
                        <div class="expanded-row-value">
                          <slot :name="`cell-${colKey}`" :row="row" :value="row[colKey]">
                            {{ row[colKey] }}
                          </slot>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <div class="pagination-container border-t border-slate-200 p-4 pb-0 dark:border-slate-700"> -->
    <div class="pagination-container px-4 pt-2 pb-0">
      <p class="pagination-info">
        Página {{ localCurrentPage }} de {{ computedTotalPages || 1 }}
        <span class="ml-1 text-slate-400">({{ computedTotalRecords }} registros)</span>
      </p>
      <div class="pagination-buttons">
        <button
          :disabled="localCurrentPage === 1"
          class="pagination-btn pagination-btn-nav"
          :class="localCurrentPage === 1 ? 'pagination-btn-disabled' : 'pagination-btn-inactive'"
          @click="goToPage(localCurrentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <template v-for="page in computedTotalPages" :key="page">
          <button
            v-if="shouldShowPage(page)"
            class="pagination-btn pagination-btn-page"
            :class="page === localCurrentPage ? 'pagination-btn-active' : 'pagination-btn-inactive'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else-if="shouldShowEllipsis(page)" class="pagination-ellipsis">...</span>
        </template>

        <button
          :disabled="localCurrentPage === computedTotalPages"
          class="pagination-btn pagination-btn-nav"
          :class="
            localCurrentPage === computedTotalPages ? 'pagination-btn-disabled' : 'pagination-btn-inactive'
          "
          @click="goToPage(localCurrentPage + 1)"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
