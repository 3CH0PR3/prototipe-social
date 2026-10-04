export const CATEGORY_EXPORT_SCHEMA = {
  title: 'Catálogo de Categorías SUI',
  sheetName: 'Categorías',
  headers: ['CÓDIGO', 'NOMBRE', 'DESCRIPCIÓN', 'ESTADO'],
  headersVerbose: ['Código', 'Nombre', 'Descripción', 'Estado'],
  toRow: (row) => [row.code ?? '', row.name ?? '', row.description ?? '', row.status ? 'ACTIVO' : 'INACTIVO'],
  colWidths: [15, 30, 40, 15],
  pdfOrientation: 'portrait',
  pdfColumnStyles: {
    0: { cellWidth: 25 },
    1: { cellWidth: 50 },
    2: { cellWidth: 80 },
    3: { cellWidth: 25 }
  }
};

export const MATERIAL_EXPORT_SCHEMA = {
  title: 'Catálogo de Materiales SUI',
  sheetName: 'Materiales SUI',
  headers: ['CÓDIGO', 'NOMBRE', 'CATEGORÍA', 'DESCRIPCIÓN', 'ESTADO'],
  headersVerbose: ['Código', 'Nombre', 'Categoría', 'Descripción', 'Estado'],
  toRow: (row) => [
    row.code ?? '',
    row.name ?? '',
    row.category?.name ?? '',
    row.description ?? '',
    row.status ? 'ACTIVO' : 'INACTIVO'
  ],
  colWidths: [15, 30, 30, 40, 15],
  pdfOrientation: 'landscape',
  pdfColumnStyles: {
    0: { cellWidth: 25 },
    1: { cellWidth: 50 },
    2: { cellWidth: 50 },
    3: { cellWidth: 90 },
    4: { cellWidth: 25 }
  }
};

export const PRODUCT_EXPORT_SCHEMA = {
  title: 'Catálogo de Subproductos',
  sheetName: 'Subproductos',
  headers: ['NOMBRE', 'MATERIAL SUI', 'PRECIO', 'ES TARIFABLE', 'ESTADO'],
  headersVerbose: ['Nombre', 'Material SUI', 'Precio', 'Es Tarifable', 'Estado'],
  toRow: (row) => [
    row.name ?? '',
    row.material?.name ?? '',
    row.price ?? '0',
    row.is_tarifable ? 'SÍ' : 'NO',
    row.status ? 'ACTIVO' : 'INACTIVO'
  ],
  colWidths: [30, 30, 15, 15, 15],
  pdfOrientation: 'landscape',
  pdfColumnStyles: {
    0: { cellWidth: 70 },
    1: { cellWidth: 70 },
    2: { cellWidth: 30 },
    3: { cellWidth: 30 },
    4: { cellWidth: 30 }
  }
};
