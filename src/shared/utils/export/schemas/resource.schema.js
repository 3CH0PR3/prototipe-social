const toRow = (r, index) => [
  r.nuap ?? '',
  r.provider_collections?.rna_business_id ?? '',
  r.dates?.payment_period ?? '',
  r.received_value ?? '',
  r.dates?.date_resources_received ?? ''
];

export const RESOURCE_EXPORT_SCHEMA = {
  title: 'Recepción de Recursos de Aprovechamiento',
  sheetName: 'Recepción Recursos',

  headers: [1, 2, 3, 4, 5],

  headersVerbose: ['NUAP', 'ID Prestador RNA', 'Período de pago', 'Valor recibido ($)', 'Fecha recepción'],

  toRow,
  colWidths: [16, 18, 16, 20, 16],

  pdfOrientation: 'portrait',
  pdfColumnStyles: {
    1: { cellWidth: 32 },
    2: { cellWidth: 28 },
    3: { cellWidth: 24 },
    4: { cellWidth: 30 },
    5: { cellWidth: 24 }
  }
};
