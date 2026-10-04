export function useTableExport({ filename, columns, data, getValue }) {
  // Resuelve el valor de una celda — usa getValue personalizado si existe
  const resolveValue = (row, key) => {
    if (getValue) return getValue(row, key) ?? '';
    const val = row[key];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // Construye matrix [ [headers], [row1], [row2], ... ]
  const buildMatrix = () => {
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) => columns.map((c) => resolveValue(row, c.key)));
    return [headers, ...rows];
  };

  // ── CSV ──────────────────────────────────────────────────────────────────
  const exportCSV = async () => {
    const { utils, writeFile } = await import('xlsx');
    const matrix = buildMatrix();
    const ws = utils.aoa_to_sheet(matrix);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Datos');
    writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  };

  // ── EXCEL (.xlsx) ─────────────────────────────────────────────────────────
  const exportExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    const matrix = buildMatrix();
    const ws = utils.aoa_to_sheet(matrix);

    // Ancho automático de columnas
    ws['!cols'] = columns.map((_, i) => ({
      wch:
        Math.max(
          columns[i].label.length,
          ...data.map((row) => String(resolveValue(row, columns[i].key)).length)
        ) + 2
    }));

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Datos');
    writeFile(wb, `${filename}.xlsx`);
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    const head = [columns.map((c) => c.label)];
    const body = data.map((row) => columns.map((c) => resolveValue(row, c.key)));

    doc.setFontSize(13);
    doc.text(filename, 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Exportado el ${new Date().toLocaleDateString('es-CO')}`, 14, 21);

    autoTable(doc, {
      head,
      body,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [248, 248, 255] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`${filename}.pdf`);
  };

  // ── WORD (.docx) ──────────────────────────────────────────────────────────
  const exportWord = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType } =
      await import('docx');

    const headerRow = new TableRow({
      children: columns.map(
        (c) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: c.label, bold: true, size: 20 })],
                alignment: AlignmentType.CENTER
              })
            ],
            shading: { fill: '6366F1' }
          })
      )
    });

    const dataRows = data.map(
      (row) =>
        new TableRow({
          children: columns.map(
            (c) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: resolveValue(row, c.key), size: 18 })]
                  })
                ]
              })
          )
        })
    );

    const table = new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: filename, bold: true, size: 28 })],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Exportado el ${new Date().toLocaleDateString('es-CO')}`,
                  size: 18,
                  color: '888888'
                })
              ],
              spacing: { after: 400 }
            }),
            table
          ]
        }
      ]
    });

    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Dispatcher ────────────────────────────────────────────────────────────
  const exportAs = async (format) => {
    switch (format) {
      case 'csv':
        return exportCSV();
      case 'excel':
        return exportExcel();
      case 'pdf':
        return exportPDF();
      case 'word':
        return exportWord();
    }
  };

  return { exportAs };
}
