const daneToDepto = (dane) => (dane ? String(dane).padStart(5, '0').slice(0, 2) : '');
const daneToMunicipio = (dane) => (dane ? String(dane).padStart(5, '0').slice(2) : '');

const fullName = (m) =>
  [
    m.first_name,
    m.second_name !== 'N/A' ? m.second_name : null,
    m.paternal_surname,
    m.maternal_surname !== 'N/A' ? m.maternal_surname : null
  ]
    .filter(Boolean)
    .join(' ');

const toRow = (m) => [
  daneToDepto(m.dane_code),
  daneToMunicipio(m.dane_code),
  m.type_identifier?.code ?? '',
  m.identity_card ?? '',
  fullName(m)
];

export const MEMBER_EXPORT_SCHEMA = {
  title: 'Registro de Miembros de Compañía',
  sheetName: 'Miembros',

  headers: [1, 2, 3, 4, 5],

  headersVerbose: ['Departamento', 'Municipio', 'Tipo Doc.', 'Documento', 'Nombre completo'],

  toRow,

  colWidths: [16, 16, 12, 18, 50],

  pdfOrientation: 'landscape',

  pdfColumnStyles: {
    0: { cellWidth: 25 },
    1: { cellWidth: 25 },
    2: { cellWidth: 18 },
    3: { cellWidth: 28 },
    4: { cellWidth: 80 }
  }
};
