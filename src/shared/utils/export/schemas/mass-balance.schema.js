/**
 * Schema de exportación para Balance de Masas.
 * Compatible con el exportEngine compartido.
 *
 * CSV     → 1,2,3,4,5,6,7,8,9,10,11
 * Excel   → encabezados descriptivos
 */

const toRow = (b) => [
  b.eca?.nueca ?? b.nueca ?? '',
  b.macro_route?.numacro ?? b.numacro_id ?? '',
  b.number_week ?? '',
  b.recycler_type?.code ?? '', // Código: 1=CC, 2=CE, 3=PAS, 4=NIT
  b.identity_card ?? '',
  b.vehicle_number_plate ?? '',
  Number((parseFloat(b.quantity_material_incoming) || 0) / 1000).toFixed(4),
  b.material_type?.code ?? '', // Código del material: 101, 202, etc.
  Number((parseFloat(b.quantity_material_incoming_refused) || 0) / 1000).toFixed(4),
  b.site_refused_type?.code ?? '', // Código: 1=Relleno, 2=ECA
  b.number_target_site ?? '' // Código NUSDE
];

export const MASS_BALANCE_EXPORT_SCHEMA = {
  title: 'Balance de Masas',
  sheetName: 'BalanceMasas',

  // CSV: encabezados numéricos según formato oficial SSPD
  headers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],

  // Excel / PDF: encabezados descriptivos
  headersVerbose: [
    'NUECA',
    'NUMACRO',
    'Semana',
    'Tipo Ident.',
    'N° Identificación',
    'Placa',
    'Entrante (t)',
    'Cód. Material',
    'Rechazo (t)',
    'Cód. Destino Rechazo',
    'NUSDE Destino'
  ],

  toRow,

  colWidths: [15, 15, 10, 12, 18, 12, 14, 14, 14, 22, 20],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 15 },
    1: { cellWidth: 15 },
    2: { cellWidth: 10 },
    3: { cellWidth: 12 },
    4: { cellWidth: 18 },
    5: { cellWidth: 12 },
    6: { cellWidth: 14 },
    7: { cellWidth: 14 },
    8: { cellWidth: 14 },
    9: { cellWidth: 22 },
    10: { cellWidth: 20 }
  }
};
