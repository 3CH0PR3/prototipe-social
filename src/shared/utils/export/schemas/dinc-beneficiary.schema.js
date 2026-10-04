const toRow = (r, index) => [
  r.numacro_id ?? '',
  r.nuis ?? '',
  r.incentive_percentage ? (r.incentive_percentage / 100).toFixed(2) : '',
  r.dates?.date_material_incoming ?? ''
];

export const DINC_EXPORT_SCHEMA = {
  title: 'Beneficiarios DINC',
  sheetName: 'DINC',
  headers: [1, 2, 3, 4],
  headersVerbose: ['NUMACRO', 'NUIS / NUID', 'Incentivo DINC', 'Fecha Recolección'],
  toRow,
  colWidths: [20, 20, 16, 20],
  pdfOrientation: 'portrait',
  pdfColumnStyles: {
    1: { cellWidth: 40 },
    2: { cellWidth: 40 },
    3: { cellWidth: 26 },
    4: { cellWidth: 30 }
  }
};
