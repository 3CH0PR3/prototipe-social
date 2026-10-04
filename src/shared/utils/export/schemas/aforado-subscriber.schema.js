const toRow = (r, index) => [
  index + 1,
  r.macro_route?.numacro ?? '',
  r.nuis ?? '',
  r.nuap ?? '',
  r.address?.code ?? '',
  r.use_class?.code ?? '',
  r.aforo_type?.code ?? '',
  r.tons_harvested ?? ''
];

export const AFORADO_EXPORT_SCHEMA = {
  title: 'Suscriptores Aforados de Aprovechamiento',
  sheetName: 'Aforados',
  headers: [1, 2, 3, 4, 5, 6, 7, 8],
  headersVerbose: [
    'N°',
    'NUMACRO',
    'NUIS / NUID',
    'NUAP RNA',
    'Cód. dirección',
    'Clase de uso',
    'Tipo aforo',
    'Tons. aprovechadas'
  ],
  toRow,
  colWidths: [6, 16, 18, 16, 16, 14, 18, 18],
  pdfOrientation: 'landscape',
  pdfColumnStyles: {
    0: { cellWidth: 10 },
    1: { cellWidth: 26 },
    2: { cellWidth: 28 },
    3: { cellWidth: 22 },
    4: { cellWidth: 22 },
    5: { cellWidth: 20 },
    6: { cellWidth: 26 },
    7: { cellWidth: 26 }
  }
};
