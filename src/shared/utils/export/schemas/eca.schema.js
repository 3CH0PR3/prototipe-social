/**
 * Schema de exportación para ECA
 * Estaciones de Clasificación y Aprovechamiento
 *
 * CSV     → 1,2,3,4,5,6,7,8,9,10
 *           nueca,nombre,departamento,municipio,direccion,lat,lng,inicio,fin,registro
 * Excel/PDF → encabezados descriptivos
 */

import { formatDateTime } from '@shared/helpers/formatters';

const toRow = (e) => [
  e.nueca ?? '',
  e.name ?? '',
  e.department?.name ?? '',
  e.municipality?.name ?? '',
  e.address ?? '',
  e.latitude ?? '',
  e.longitude ?? '',
  formatDateTime(e.dates?.start_operations_date),
  formatDateTime(e.dates?.end_operations_date),
  formatDateTime(e.dates?.created_at)
];

export const ECA_EXPORT_SCHEMA = {
  title: 'Registro de Estaciones de Clasificación y Aprovechamiento',
  sheetName: 'ECAs',

  // CSV: encabezados numéricos según formato oficial
  headers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

  // Excel / PDF: encabezados descriptivos
  headersVerbose: [
    'NUECA',
    'Nombre ECA',
    'Departamento',
    'Municipio',
    'Dirección',
    'Latitud',
    'Longitud',
    'Inicio ops.',
    'Fin ops.',
    'Registro'
  ],

  toRow,

  // Anchos de columna Excel (caracteres)
  colWidths: [16, 36, 22, 22, 34, 14, 14, 14, 14, 14],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 28 }, // NUECA
    1: { cellWidth: 42 }, // Nombre
    2: { cellWidth: 28 }, // Departamento
    3: { cellWidth: 28 }, // Municipio
    4: { cellWidth: 36 }, // Dirección
    5: { cellWidth: 18 }, // Latitud
    6: { cellWidth: 18 }, // Longitud
    7: { cellWidth: 16 }, // Inicio
    8: { cellWidth: 16 }, // Fin
    9: { cellWidth: 18 } // Registro
  }
  // Total: 28+42+28+28+36+18+18+16+16+18 = 248mm — cabe en A4 landscape con márgenes 14mm
};
