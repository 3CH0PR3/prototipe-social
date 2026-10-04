const toRow = (v) => [
  v.nuap ?? '',
  v.vehicle_type?.code ?? '',
  v.number_plate ?? '',
  v.brand ?? '',
  v.capacity?.yd3 ?? '',
  v.capacity?.ton ?? '',
  v.num_axes ?? '',
  v.dates?.registration_date ?? '',
  v.dates?.start_operations_date ?? '',
  v.num_turns ?? ''
];

export const VEHICLE_EXPORT_SCHEMA = {
  title: 'Registro de Vehículos',
  sheetName: 'Vehículos',

  headers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

  headersVerbose: [
    'NUAP',
    'Tipo',
    'Placa',
    'Marca',
    'Cap. YD³',
    'Cap. TON',
    'Ejes',
    'F. Matrícula',
    'Inicio ops.',
    'Turnos'
  ],

  toRow,

  colWidths: [16, 8, 14, 20, 10, 10, 8, 14, 14, 8],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 28 },
    1: { cellWidth: 10 },
    2: { cellWidth: 18 },
    3: { cellWidth: 28 },
    4: { cellWidth: 14 },
    5: { cellWidth: 14 },
    6: { cellWidth: 10 },
    7: { cellWidth: 20 },
    8: { cellWidth: 20 },
    9: { cellWidth: 10 }
  }
};
