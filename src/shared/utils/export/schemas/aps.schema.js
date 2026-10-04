/**
 * Schema de exportación para APS
 * Basado en: "REGISTRO DE ÁREAS DE LA ACTIVIDAD DE APROVECHAMIENTO"
 *
 * CSV  → encabezados numéricos: 1,2,3,4,5,6,7,8
 * Excel/PDF → encabezados descriptivos
 *
 * Orden columnas: N° | NUAP | Departamento | Municipio | Nombre APS | Inicio ops. | Fin ops. | Registro
 */

import { formatDateTime } from '@shared/helpers/formatters';

const toRow = (a, index) => [
  index + 1,
  a.nuap ?? '',
  a.department?.name ?? '',
  a.municipality?.name ?? '',
  a.name ?? '',
  formatDateTime(a.dates?.start_operations_date),
  formatDateTime(a.dates?.end_operations_date),
  formatDateTime(a.dates?.created_at)
];

export const APS_EXPORT_SCHEMA = {
  title: 'Registro de Áreas de Prestación de Servicio.',
  sheetName: 'APS',

  // CSV: encabezados numéricos según el formato oficial
  headers: [1, 2, 3, 4, 5, 6, 7, 8],

  // Excel / PDF: encabezados descriptivos
  headersVerbose: [
    'N°',
    'NUAP',
    'Departamento',
    'Municipio',
    'Nombre APS',
    'Inicio ops.',
    'Fin ops.',
    'Registro'
  ],

  toRow,

  colWidths: [6, 18, 24, 24, 40, 16, 16, 16],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 10 },
    1: { cellWidth: 28 },
    2: { cellWidth: 38 },
    3: { cellWidth: 38 },
    4: { cellWidth: 50 },
    5: { cellWidth: 24 },
    6: { cellWidth: 24 },
    7: { cellWidth: 24 }
  }
};
