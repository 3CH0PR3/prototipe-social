/**
 * Motor de exportación genérico.
 * Cada módulo define su propio schema (headers + toRow) y llama generateExport().
 *
 * @example
 * import { generateExport }    from '@shared/utils/export/exportEngine'
 * import { APS_EXPORT_SCHEMA } from '@shared/utils/export/schemas/aps.schema'
 *
 * await generateExport('csv', data, APS_EXPORT_SCHEMA, 'aps-2026-01-15')
 */

// ── helpers ───────────────────────────────────────────────────────────────────

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convierte un SVG (URL) a base64 PNG via canvas para poder embeberse en jsPDF.
 * @param {string} svgUrl
 * @param {number} w  ancho destino px
 * @param {number} h  alto destino px
 * @returns {Promise<string>} data URL base64
 */
// const svgToBase64 = (svgUrl, w = 160, h = 60) =>
//   new Promise((resolve) => {
//     const img    = new Image()
//     img.crossOrigin = 'anonymous'
//     img.onload  = () => {
//       const canvas = document.createElement('canvas')
//       canvas.width  = w
//       canvas.height = h
//       canvas.getContext('2d').drawImage(img, 0, 0, w, h)
//       resolve(canvas.toDataURL('image/png'))
//     }
//     img.onerror = () => resolve(null)   // sin logo si falla, no rompemos el PDF
//     img.src = svgUrl
//   })

// ── CSV ───────────────────────────────────────────────────────────────────────

const exportToCsv = (data, schema, filename) => {
  const rows = [schema.headers, ...data.map(schema.toRow)];
  const csv = rows.map((r) => r.map((v) => String(v ?? '')).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
};

// ── EXCEL ─────────────────────────────────────────────────────────────────────

const exportToExcel = async (data, schema, filename) => {
  const XLSX = await import('xlsx');
  const headers = schema.headersVerbose ?? schema.headers;
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data.map(schema.toRow)]);

  ws['!cols'] = schema.colWidths
    ? schema.colWidths.map((w) => ({ wch: w }))
    : headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, schema.sheetName ?? 'Datos');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ── PDF ───────────────────────────────────────────────────────────────────────

// const LOGO_URL = new URL('@/assets/img/central/logos/logo-wrc.svg', import.meta.url).href

const drawPdfHeader = async (doc, schema, totalRecords, pageWidth) => {
  // Intenta cargar el logo
  // const logoB64 = await svgToBase64(LOGO_URL, 160, 60)

  const MARGIN = 14;
  const now = new Date();
  const fecha = now.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // ── Franja superior azul institucional ──────────────────────────────────────
  doc.setFillColor(30, 64, 175); // azul oscuro
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Texto institucional en la franja
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE GESTIÓN EMPRESARIAL — GEA WRC', MARGIN, 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    'Superintendencia de Servicios Públicos Domiciliarios  |  Actividad de Aprovechamiento',
    MARGIN,
    13
  );

  // Fecha en el extremo derecho de la franja
  doc.setFontSize(7);
  doc.text(fecha, pageWidth - MARGIN, 13, { align: 'right' });

  // ── Logo (si cargó) ─────────────────────────────────────────────────────────
  // if (logoB64) {
  //   doc.addImage(logoB64, 'PNG', pageWidth - 44, 20, 30, 11)
  // }

  // ── Resolución de referencia ────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'italic');
  doc.text('Ref: Resolución SSPD 20211000650805 del 03-11-2021', MARGIN, 24);
  doc.setFont('helvetica', 'normal');

  // ── Título del reporte ──────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(schema.title ?? 'Reporte', MARGIN, 33);

  // ── Línea separadora ────────────────────────────────────────────────────────
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 36, pageWidth - MARGIN, 36);

  // ── Metadatos ────────────────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generado: ${now.toLocaleString('es-CO')}   ·   Total registros: ${totalRecords}   ·   Dirección Técnica de Gestión de Aseo`,
    MARGIN,
    41
  );

  // Retorna la Y donde debe comenzar la tabla
  return 45;
};

const exportToPdf = async (data, schema, filename) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const orientation = schema.pdfOrientation ?? 'landscape';
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const headers = schema.headersVerbose ?? schema.headers;

  const startY = await drawPdfHeader(doc, schema, data.length, pageWidth);

  // Calcula el ancho total de la tabla sumando los cellWidths definidos
  const colStyles = schema.pdfColumnStyles ?? {};
  const totalCols = headers.length;
  const totalTableW =
    Object.values(colStyles).reduce((sum, s) => sum + (s.cellWidth ?? 20), 0) || totalCols * 20;

  // Centra la tabla en la página
  const marginLeft = Math.max(10, (pageWidth - totalTableW) / 2);

  autoTable(doc, {
    startY,
    head: [headers],
    body: data.map(schema.toRow),
    margin: { left: marginLeft, right: marginLeft },
    tableWidth: totalTableW,
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      overflow: 'ellipsize'
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5
    },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    ...(schema.pdfColumnStyles ? { columnStyles: schema.pdfColumnStyles } : {}),

    didDrawPage: ({ doc: d }) => {
      const pw = d.internal.pageSize.getWidth();
      const ph = d.internal.pageSize.getHeight();
      d.setFontSize(7);
      d.setTextColor(148, 163, 184);
      d.text(
        `Página ${d.internal.getCurrentPageInfo().pageNumber}  —  GEA WRC  |  Gestión de Aprovechamiento`,
        pw / 2,
        ph - 6,
        { align: 'center' }
      );
    }
  });

  doc.save(`${filename}.pdf`);
};

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * @param {'csv'|'excel'|'pdf'} format
 * @param {Array}               data
 * @param {Object}              schema
 * @param {string}              [filename]  Sin extensión
 */
export const generateExport = async (format, data, schema, filename) => {
  const ts = new Date().toISOString().slice(0, 10);
  const name = filename ?? `export-${ts}`;

  if (format === 'csv') return exportToCsv(data, schema, name);
  if (format === 'excel') return exportToExcel(data, schema, name);
  if (format === 'pdf') return exportToPdf(data, schema, name);
};
