<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ChevronDown, ChevronRight, ChevronsUpDown, ChevronUp } from '@lucide/vue';

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  rowKey: { type: [String, Function], default: 'id' },
  sortField: { type: String, default: '' },
  sortDir: { type: String, default: 'desc' },
  showIndex: { type: Boolean, default: true }
});

const emit = defineEmits(['sort']);

const width = ref(1200);
const wrapperRef = ref(null);
const expandedRows = ref(new Set());

let observer;

function getRowId(row, index) {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index);
  return row?.[props.rowKey] ?? index;
}

function toggleExpand(row, index) {
  const id = getRowId(row, index);
  const next = new Set(expandedRows.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedRows.value = next;
}

function isExpanded(row, index) {
  return expandedRows.value.has(getRowId(row, index));
}

const visibleColumns = computed(() => {
  const staticBudget = props.showIndex ? 150 : 110;
  const available = Math.max(width.value - staticBudget, 140);

  const alwaysVisible = props.columns.filter((col) => col.alwaysVisible);
  const candidates = props.columns
    .filter((col) => !col.alwaysVisible)
    .slice()
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  let used = alwaysVisible.reduce((sum, col) => sum + (col.minWidth ?? 140), 0);
  const keep = new Set(alwaysVisible.map((col) => col.key));

  for (const col of candidates) {
    const min = col.minWidth ?? 140;
    if (used + min <= available) {
      keep.add(col.key);
      used += min;
    }
  }

  return props.columns.filter((col) => keep.has(col.key));
});

const hiddenColumns = computed(() => {
  const visible = new Set(visibleColumns.value.map((col) => col.key));
  return props.columns.filter((col) => !visible.has(col.key));
});

watch(hiddenColumns, (cols) => {
  if (!cols.length) expandedRows.value = new Set();
});

onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    width.value = entry.contentRect.width;
  });
  if (wrapperRef.value) observer.observe(wrapperRef.value);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div ref="wrapperRef" class="card shadow-sm">
    <div class="card-header border-bottom d-flex align-items-center justify-content-between py-3 px-4">
      <div>
        <h3 class="mb-0 h5 fw-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="mb-0 mt-1 text-muted small">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th
              v-if="showIndex"
              class="text-start px-4 py-3 text-uppercase fw-semibold text-muted small"
              style="width: 60px"
            >
              #
            </th>

            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[
                'px-3 py-3 text-uppercase fw-semibold text-muted small user-select-none',
                column.align === 'right'
                  ? 'text-end'
                  : column.align === 'center'
                    ? 'text-center'
                    : 'text-start',
                column.sortable ? 'cursor-pointer' : ''
              ]"
              :style="{ cursor: column.sortable ? 'pointer' : 'default' }"
              @click="column.sortable && emit('sort', column.key)"
            >
              <span class="d-inline-flex align-items-center gap-1">
                {{ column.label }}
                <template v-if="column.sortable">
                  <component
                    :is="
                      sortField === column.key
                        ? sortDir === 'asc'
                          ? ChevronUp
                          : ChevronDown
                        : ChevronsUpDown
                    "
                    :class="['icon-sm', sortField === column.key ? 'text-primary' : 'text-muted']"
                    :style="{ width: '14px', height: '14px' }"
                  />
                </template>
              </span>
            </th>

            <th
              v-if="hiddenColumns.length"
              class="text-center px-3 py-3 text-uppercase fw-semibold text-muted small"
              style="width: 120px"
            >
              Detalles
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(row, rowIndex) in rows" :key="getRowId(row, rowIndex)">
            <tr>
              <td v-if="showIndex" class="px-4 py-3 text-muted small font-monospace">
                {{ rowIndex + 1 }}
              </td>

              <td
                v-for="column in visibleColumns"
                :key="column.key"
                class="px-3 py-3"
                :class="
                  column.align === 'right'
                    ? 'text-end'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-start'
                "
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                  :column="column"
                  :row-index="rowIndex"
                >
                  <span>{{ row[column.key] }}</span>
                </slot>
              </td>

              <td v-if="hiddenColumns.length" class="px-3 py-3 text-center">
                <i class="d-inline-flex align-items-center gap-1" @click="toggleExpand(row, rowIndex)">
                  <component
                    :is="isExpanded(row, rowIndex) ? ChevronDown : ChevronRight"
                    style="width: 14px; height: 14px"
                  />
                </i>
              </td>
            </tr>

            <tr v-if="hiddenColumns.length && isExpanded(row, rowIndex)" class="bg-light">
              <td
                :colspan="(showIndex ? 1 : 0) + visibleColumns.length + 1"
                class="px-4 py-4 border-bottom border-secondary border-opacity-10"
              >
                <div class="row g-3">
                  <div
                    v-for="column in hiddenColumns"
                    :key="`hidden-${getRowId(row, rowIndex)}-${column.key}`"
                    class="col-12 col-md-6"
                  >
                    <div class="border rounded p-3 bg-white">
                      <p
                        class="text-uppercase fw-semibold small mb-2"
                        style="font-size: 0.7rem; letter-spacing: 0.05em"
                      >
                        {{ column.label }}
                      </p>
                      <slot
                        :name="`cell-${column.key}`"
                        :row="row"
                        :value="row[column.key]"
                        :column="column"
                        :row-index="rowIndex"
                      >
                        <p class="mb-0">{{ row[column.key] }}</p>
                      </slot>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.icon-sm {
  width: 14px;
  height: 14px;
}

/* Responsive table */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table tbody td {
  vertical-align: middle;
}
</style>
