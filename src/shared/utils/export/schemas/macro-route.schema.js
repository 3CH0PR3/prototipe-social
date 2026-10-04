/**
 * Schema de exportación para Macro Rutas
 *
 * CSV  → encabezados numéricos: 1,2,3,4,5,6,7
 * Excel/PDF → encabezados descriptivos
 *
 * Columnas: N° | Nombre | NUAP | NUMACRO | Inicio ops. | Fin ops. | Registro
 */

const toRow = (r, index) => [
  index + 1,
  r.name ?? '',
  r.nuap ?? '',
  r.numacro ?? '',
  r.dates?.start_operations ?? '',
  r.dates?.end_operations ?? '',
  r.dates?.created_at ?? ''
];

export const MACRO_ROUTE_EXPORT_SCHEMA = {
  title: 'Registro de Macro Rutas',
  sheetName: 'MacroRutas',

  headers: [1, 2, 3, 4, 5, 6, 7],

  headersVerbose: ['N°', 'Nombre', 'NUAP', 'NUMACRO', 'Inicio ops.', 'Fin ops.', 'Registro'],

  toRow,

  colWidths: [6, 36, 16, 16, 14, 14, 14],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 10 },
    1: { cellWidth: 55 },
    2: { cellWidth: 28 },
    3: { cellWidth: 28 },
    4: { cellWidth: 24 },
    5: { cellWidth: 24 },
    6: { cellWidth: 24 }
  }
};
