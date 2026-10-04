<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  showIndex: { type: Boolean, default: false },
  striped: { type: Boolean, default: false },
  hover: { type: Boolean, default: true },
  responsive: { type: Boolean, default: true },
  pagination: { type: Boolean, default: true }, // Activar/desactivar paginación
  perPageOptions: { type: Array, default: () => [5, 10, 25, 50, 100] }, // Opciones de registros por página
  defaultPerPage: { type: Number, default: 10 } // Registros por página por defecto
});

const emit = defineEmits(['rowClick', 'edit', 'delete']);

const tableClasses = computed(() => {
  const classes = ['table', 'mb-0'];
  if (props.striped) classes.push('table-striped');
  if (props.hover) classes.push('table-hover');
  return classes.join(' ');
});

// Paginación
const currentPage = ref(1);
const perPage = ref(props.defaultPerPage);
const searchQuery = ref('');

// Filtrar datos por búsqueda
const filteredRows = computed(() => {
  if (!searchQuery.value.trim()) return props.rows;

  const query = searchQuery.value.toLowerCase().trim();

  return props.rows.filter((row) => {
    // Buscar en todas las columnas definidas
    return props.columns.some((column) => {
      const value = row[column.key];
      if (value == null) return false;
      return String(value).toLowerCase().includes(query);
    });
  });
});

// Calcular total de páginas
const totalPages = computed(() => {
  if (!props.pagination) return 1;
  return Math.ceil(filteredRows.value.length / perPage.value);
});

// Datos paginados
const paginatedRows = computed(() => {
  const data = filteredRows.value;

  if (!props.pagination) return data;

  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return data.slice(start, end);
});

// Cambiar página
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// Cambiar registros por página
const changePerPage = (value) => {
  perPage.value = value === 'all' ? filteredRows.value.length : parseInt(value);
  currentPage.value = 1; // Resetear a la primera página
};

// Páginas visibles en el paginador
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    // Mostrar todas las páginas si son 7 o menos
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Mostrar páginas con elipsis
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }

  return pages;
});

// Información de registros
const recordsInfo = computed(() => {
  const total = filteredRows.value.length;

  if (!props.pagination || total === 0) {
    return `Mostrando ${total} registros`;
  }

  const start = (currentPage.value - 1) * perPage.value + 1;
  const end = Math.min(currentPage.value * perPage.value, total);

  // Mostrar info de filtrado si hay búsqueda activa
  if (searchQuery.value.trim() && total < props.rows.length) {
    return `Mostrando ${start} a ${end} de ${total} registros (filtrados de ${props.rows.length} totales)`;
  }

  return `Mostrando ${start} a ${end} de ${total} registros`;
});

// Sistema responsivo
const containerRef = ref(null);
const containerWidth = ref(1200);
const expandedRows = ref(new Set());

let resizeObserver = null;

// Calcular columnas visibles según el ancho
const visibleColumns = computed(() => {
  if (!props.responsive) return props.columns;

  const indexWidth = props.showIndex ? 60 : 0;
  const availableWidth = containerWidth.value - indexWidth - 100;

  const alwaysVisible = props.columns.filter((col) => col.alwaysVisible);

  const optional = props.columns
    .filter((col) => !col.alwaysVisible)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));

  let usedWidth = alwaysVisible.reduce((sum, col) => {
    const width = parseInt(col.width) || 150;
    return sum + width;
  }, 0);

  const visible = new Set(alwaysVisible.map((col) => col.key));

  for (const col of optional) {
    const colWidth = parseInt(col.width) || 150;
    if (usedWidth + colWidth <= availableWidth) {
      visible.add(col.key);
      usedWidth += colWidth;
    }
  }

  return props.columns.filter((col) => visible.has(col.key));
});

// Columnas ocultas
const hiddenColumns = computed(() => {
  if (!props.responsive) return [];
  const visibleKeys = new Set(visibleColumns.value.map((col) => col.key));
  return props.columns.filter((col) => !visibleKeys.has(col.key));
});

// Funciones de expansión
const toggleExpand = (row, index) => {
  const id = row.id || index;
  const newSet = new Set(expandedRows.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  expandedRows.value = newSet;
};

const isExpanded = (row, index) => {
  const id = row.id || index;
  return expandedRows.value.has(id);
};

// Observer para detectar cambios de tamaño
onMounted(() => {
  if (props.responsive && containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        containerWidth.value = entry.contentRect.width;
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div ref="containerRef" class="card shadow-sm">
    <!-- Header -->
    <div
      v-if="title || subtitle || hiddenColumns.length"
      class="card-header border-bottom border-secondary border-opacity-10 py-3 px-4"
    >
      <div class="row align-items-center">
        <!-- Título y subtítulo -->
        <div class="col-12 col-md-6 mb-3 mb-md-0">
          <h3 class="mb-0 h5 fw-semibold">{{ title }}</h3>
          <p v-if="subtitle" class="mb-0 mt-1 text-muted small">
            {{ subtitle }}
          </p>
          <div v-if="hiddenColumns.length" class="text-muted small mt-1">
            <i class="bi bi-eye-slash"></i>
            {{ hiddenColumns.length }} columna{{ hiddenColumns.length > 1 ? 's' : '' }} oculta{{
              hiddenColumns.length > 1 ? 's' : ''
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="table-responsive">
      <div class="row mx-0 justify-content-between my-4">
        <!-- Selector de registros por página -->
        <div class="col-12 col-md-4 mb-3 mb-md-0">
          <div class="d-flex align-items-center gap-2">
            <label class="mb-0 text-muted small">Mostrar:</label>
            <select
              class="form-select form-select-sm"
              style="width: auto"
              :value="perPage === rows.length ? 'all' : perPage"
              @change="changePerPage($event.target.value)"
            >
              <option v-for="option in perPageOptions" :key="option" :value="option">
                {{ option }}
              </option>
              <option value="all">Todos</option>
            </select>
            <span class="text-muted small">registros</span>
          </div>
        </div>

        <!-- Buscador -->
        <div class="col-12 col-md-3">
          <div class="input-group input-group-sm">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="search"
              name="simple_table_search_query"
              autocomplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              class="form-control"
              placeholder="Buscar..."
              @input="currentPage = 1"
            />
            <button
              v-if="searchQuery"
              class="btn btn-outline-secondary"
              type="button"
              @click="searchQuery = ''"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <table :class="tableClasses">
        <thead class="border-0 bg-light bg-opacity-25">
          <tr>
            <th v-if="hiddenColumns.length" class="text-center" style="width: 60px">#</th>
            <th v-if="showIndex" class="text-center" style="width: 60px">ID</th>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[
                column.align === 'right'
                  ? 'text-end'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-start'
              ]"
              :style="column.width ? `width: ${column.width}` : ''"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(row, index) in paginatedRows" :key="row.id || index">
            <tr @click="emit('rowClick', row)">
              <td v-if="hiddenColumns.length" class="text-center px-2">
                <button
                  class="btn btn-sm w-100 h-100 py-2 rounded-circle"
                  :title="isExpanded(row, index) ? 'Ocultar detalles' : 'Ver detalles'"
                  @click.stop="toggleExpand(row, index)"
                >
                  <i :class="['bi fs-5', isExpanded(row, index) ? 'bi-dash-circle' : 'bi-plus-circle']"></i>
                </button>
              </td>

              <td v-if="showIndex" class="text-center text-muted small">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>

              <td
                v-for="column in visibleColumns"
                :key="column.key"
                :class="[
                  'px-3 py-3',
                  column.align === 'right'
                    ? 'text-end'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-start'
                ]"
              >
                <!-- Slot personalizado para cada columna -->
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="index">
                  <!-- Valor por defecto -->
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>

            <!-- Fila expandida con columnas ocultas -->
            <tr v-if="hiddenColumns.length && isExpanded(row, index)" class="bg-light">
              <td :colspan="visibleColumns.length + (showIndex ? 1 : 0) + 1" class="px-4 py-3">
                <div class="row g-3">
                  <div v-for="column in hiddenColumns" :key="`hidden-${column.key}`" class="col-12">
                    <div class="d-flex align-items-start gap-2">
                      <strong class="text-muted small text-nowrap" style="min-width: 100px">
                        {{ column.label }}:
                      </strong>
                      <div class="flex-grow-1">
                        <!-- Slot para columnas ocultas -->
                        <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="index">
                          {{ row[column.key] }}
                        </slot>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-if="!paginatedRows.length">
            <td
              :colspan="visibleColumns.length + (showIndex ? 1 : 0) + (hiddenColumns.length ? 1 : 0)"
              class="text-center py-5 text-muted"
            >
              <slot name="empty">
                <div v-if="searchQuery.trim()">
                  <i class="bi bi-search" style="font-size: 2rem"></i>
                  <p class="mt-2 mb-0">No se encontraron resultados para "{{ searchQuery }}"</p>
                  <button class="btn btn-sm btn-link" @click="searchQuery = ''">Limpiar búsqueda</button>
                </div>
                <div v-else>No hay datos disponibles</div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      v-if="pagination && filteredRows.length > 0"
      class="card-footer border-top border-secondary border-opacity-10 py-3 px-4"
    >
      <div class="row align-items-center justify-content-between">
        <!-- Información de registros -->
        <div class="col-12 col-md-4 mb-3 mb-md-0">
          <span class="text-muted small">{{ recordsInfo }}</span>
        </div>

        <!-- Paginador -->
        <div class="col-12 col-md-4">
          <nav aria-label="Paginación">
            <ul class="pagination pagination-sm justify-content-end mb-0">
              <!-- Botón Anterior -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>

              <!-- Páginas -->
              <li
                v-for="(page, idx) in visiblePages"
                :key="idx"
                class="page-item"
                :class="{
                  active: page === currentPage,
                  disabled: page === '...'
                }"
              >
                <button v-if="page === '...'" class="page-link" disabled>...</button>
                <button v-else class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>

              <!-- Botón Siguiente -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  :disabled="currentPage === totalPages"
                  @click="goToPage(currentPage + 1)"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.table tbody td {
  vertical-align: middle;
}

/* Detalles en fila expandida */
.flex-grow-1 {
  flex-grow: 1;
}

.text-nowrap {
  white-space: nowrap;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #6c757d;
  border-color: #dee2e6;
}

.page-link:hover {
  color: #0d6efd;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  border-color: #dee2e6;
}

/* Select de registros por página */
.form-select-sm {
  padding: 0.25rem 2rem 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
