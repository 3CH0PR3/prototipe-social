const toRow = (r, index) => [
  r.macro_route?.numacro ?? '',
  r.nuis ?? '',
  r.address ?? '',
  r.usage?.code ?? '',
  r.type?.code ?? '',
  r.multi?.code ?? ''
];

export const USER_DATABASE_EXPORT_SCHEMA = {
  title: 'Base de Datos de Usuarios',
  sheetName: 'Usuarios',

  headers: [1, 2, 3, 4, 5, 6],

  headersVerbose: [
    'NUMACRO',
    'NUIS / NUID',
    'Dirección del suscriptor',
    'Uso del usuario',
    'Tipo de usuario',
    'Multiusuario'
  ],

  toRow,
  colWidths: [16, 18, 40, 16, 16, 14],

  pdfOrientation: 'landscape',
  pdfColumnStyles: {
    1: { cellWidth: 26 },
    2: { cellWidth: 28 },
    3: { cellWidth: 60 },
    4: { cellWidth: 24 },
    5: { cellWidth: 24 },
    6: { cellWidth: 20 }
  }
};
