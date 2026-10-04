/**
 * Schema de exportación para Micro Rutas.
 *
 * Columnas: N° | Código | Nombre | Macroruta | Frecuencia | Tons/sem | Horario | Inicio ops. | Fin ops. | Registro
 */

const toRow = (r, index) => [
  r.code ?? '',
  r.name ?? '',
  r.macro_route?.name ?? '',
  r.frequency != null ? `${r.frequency}x/sem` : '',
  r.tons_produced != null ? Number(r.tons_produced).toFixed(4) : '',
  r.dates?.schedules ?? '',
  r.dates?.start_operations ?? '',
  r.dates?.end_operations ?? '',
  r.dates?.created_at ?? ''
];

export const MICRO_ROUTE_EXPORT_SCHEMA = {
  title: 'Registro de Micro Rutas',
  sheetName: 'MicroRutas',

  headers: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  headersVerbose: [
    'Código',
    'Nombre',
    'Macroruta',
    'Frecuencia',
    'Tons/semana',
    'Horario',
    'Inicio ops.',
    'Fin ops.',
    'Registro'
  ],

  toRow,

  colWidths: [14, 36, 30, 14, 14, 14, 14, 14, 14],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    1: { cellWidth: 18 },
    2: { cellWidth: 42 },
    3: { cellWidth: 36 },
    4: { cellWidth: 18 },
    5: { cellWidth: 20 },
    6: { cellWidth: 18 },
    7: { cellWidth: 20 },
    8: { cellWidth: 20 },
    9: { cellWidth: 18 }
  }
};
