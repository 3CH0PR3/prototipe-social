import { ref } from 'vue';
import { client } from '@shared/http/client';

export function useExport(url) {
  const exporting = ref(false);

  const exportData = async (format = 'csv', filename = 'export') => {
    exporting.value = true;
    try {
      const response = await client.get(url, {
        params: { format },
        responseType: 'blob'
      });

      const ext = format === 'json' ? 'json' : 'csv';
      const blob = new Blob([response.data], {
        type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;'
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      exporting.value = false;
    }
  };

  return { exporting, exportData };
}
