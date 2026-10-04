import { computed } from 'vue';
import dayjs from 'dayjs';

/**
 * Composable para definir columnas de tablas de manera declarativa
 *
 * @example
 * const { defineColumns, formatters } = useTableColumns();
 *
 * const columns = defineColumns([
 *   { key: 'id', label: 'ID', sortable: true, width: '80px' },
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'created_at', label: 'Created', format: formatters.date },
 * ]);
 */
export function useTableColumns() {
  // Formateadores comunes
  const formatters = {
    date: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '-'),
    datetime: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'),
    time: (value) => (value ? dayjs(value).format('HH:mm:ss') : '-'),
    currency: (value) => (value ? `$${parseFloat(value).toFixed(2)}` : '$0.00'),
    number: (value) => (value ? parseFloat(value).toLocaleString() : '0'),
    boolean: (value) => (value ? 'Yes' : 'No'),
    badge: (value, variant = 'primary') => ({ value, variant }),
    truncate: (value, length = 50) => {
      if (!value) return '-';
      return value.length > length ? `${value.substring(0, length)}...` : value;
    },
    status: (statusCode, statuses = {}) => {
      const status = statuses[statusCode];
      return status || { name: 'Unknown', color: 'secondary' };
    }
  };

  /**
   * Define columnas con valores por defecto
   */
  function defineColumns(columns) {
    return columns.map((col) => ({
      sortable: false,
      align: 'left',
      width: null,
      format: null,
      ...col
    }));
  }

  /**
   * Crea columnas para fechas comunes
   */
  function dateColumns(options = {}) {
    const defaults = {
      created: true,
      updated: true,
      deleted: false
    };
    const config = { ...defaults, ...options };

    const columns = [];

    if (config.created) {
      columns.push({
        key: 'dates.created_at',
        label: 'Created',
        sortable: true,
        format: formatters.datetime,
        width: '150px'
      });
    }

    if (config.updated) {
      columns.push({
        key: 'dates.updated_at',
        label: 'Updated',
        sortable: true,
        format: formatters.datetime,
        width: '150px'
      });
    }

    if (config.deleted) {
      columns.push({
        key: 'dates.deleted_at',
        label: 'Deleted',
        sortable: true,
        format: formatters.datetime,
        width: '150px'
      });
    }

    return columns;
  }

  /**
   * Crea columna de estado estándar
   */
  function statusColumn(statuses = {}) {
    return {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      format: (status) => ({
        name: status?.name || 'Unknown',
        color: status?.color || 'secondary',
        code: status?.code
      })
    };
  }

  return {
    defineColumns,
    dateColumns,
    statusColumn,
    formatters
  };
}
