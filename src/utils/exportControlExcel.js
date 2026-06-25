import ExcelJS from 'exceljs';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

const border = {
  top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right:  { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const money = '#,##0.00';

/**
 * Exporta la lista de control mensual a Excel.
 * @param {{ clientes: Array, stats: Object, anio: number, mes: number }} params
 */
export const exportControlExcel = async ({ clientes, stats, anio, mes }) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Account CRM';
  wb.created = new Date();

  const mesNombre = MESES[mes - 1].toUpperCase();
  const ws = wb.addWorksheet(`${mesNombre} ${anio}`);

  // ── Anchos de columna ──────────────────────────────────────────────────────
  ws.columns = [
    { width: 5  },  // #
    { width: 13 },  // RUC
    { width: 32 },  // NOMBRE
    { width: 12 },  // RÉGIMEN
    { width: 7  },  // PAGÓ
    { width: 10 },  // PRECIO
    { width: 10 },  // COBRADO
    { width: 10 },  // REFERIDO
    { width: 10 },  // DEUDA
    { width: 12 },  // SIRE
    { width: 12 },  // PDT 621
    { width: 35 },  // OBSERVACIONES
  ];

  // ── Título ─────────────────────────────────────────────────────────────────
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `CONTROL INTERNO – ${mesNombre} ${anio}`;
  titleCell.fill  = fill('FF0F2344');
  titleCell.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13, name: 'Montserrat' };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // ── Fila de resumen ────────────────────────────────────────────────────────
  if (stats) {
    ws.mergeCells('A2:B2'); ws.getCell('A2').value = `Total: ${stats.total}`;
    ws.mergeCells('C2:D2'); ws.getCell('C2').value = `Pagaron: ${stats.pagaron}`;
    ws.mergeCells('E2:F2'); ws.getCell('E2').value = `Cobrado: S/${Number(stats.cobrado||0).toFixed(2)}`;
    ws.mergeCells('G2:H2'); ws.getCell('G2').value = `Por cobrar: S/${Number(stats.por_cobrar||0).toFixed(2)}`;
    ws.mergeCells('I2:J2'); ws.getCell('I2').value = `Falta SIRE: ${stats.falta_sire}`;
    ws.mergeCells('K2:L2'); ws.getCell('K2').value = `Deuda total: S/${Number(stats.deuda_total||0).toFixed(2)}`;

    ['A2','C2','E2','G2','I2','K2'].forEach(addr => {
      const c = ws.getCell(addr);
      c.fill = fill('FFE0E7FF');
      c.font = { bold: true, size: 9, color: { argb: 'FF1E3A8A' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = border;
    });
    ws.getRow(2).height = 18;
  }

  // ── Cabecera de tabla ──────────────────────────────────────────────────────
  const HEADERS = ['#','RUC','NOMBRE','RÉGIMEN','PAGÓ','PRECIO','COBRADO','REFERIDO','DEUDA','SIRE','PDT 621','OBSERVACIONES'];
  const headRow = ws.getRow(3);
  headRow.values = HEADERS;
  headRow.height = 20;
  headRow.eachCell((cell) => {
    cell.fill = fill('FF1E3A8A');
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = border;
  });

  // ── Filas de datos ─────────────────────────────────────────────────────────
  clientes.forEach((c, idx) => {
    const rowNum = idx + 4;
    const deuda = parseFloat(c.precio||0) - parseFloat(c.cobrado||0) - parseFloat(c.referido_monto||0);
    const isEven = idx % 2 === 0;
    const bgFill = fill(isEven ? 'FFFFFFFF' : 'FFF8FAFC');

    const row = ws.getRow(rowNum);
    row.values = [
      idx + 1,
      c.ruc,
      `${c.nombres} ${c.apellidos || ''}`.trim(),
      c.regimen,
      c.pago,
      parseFloat(c.precio || 0),
      parseFloat(c.cobrado || 0),
      parseFloat(c.referido_monto || 0),
      deuda,
      c.sire,
      c.pdt_621,
      c.observaciones || '',
    ];
    row.height = 17;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.fill = bgFill;
      cell.border = border;
      cell.font = { size: 9, color: { argb: 'FF111827' } };
      cell.alignment = { vertical: 'middle', horizontal: colNum >= 6 && colNum <= 9 ? 'right' : 'left' };

      // Números con formato moneda
      if (colNum >= 6 && colNum <= 9) cell.numFmt = money;

      // PAGÓ: verde si SI, rojo si NO
      if (colNum === 5) {
        cell.font = {
          size: 9,
          bold: true,
          color: { argb: c.pago === 'SI' ? 'FF16A34A' : 'FFDC2626' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // DEUDA: rojo si >0, verde si <=0
      if (colNum === 9) {
        cell.font = {
          size: 9,
          bold: true,
          color: { argb: deuda > 0 ? 'FFDC2626' : 'FF16A34A' },
        };
      }

      // SIRE
      if (colNum === 10) {
        cell.font = {
          size: 9,
          bold: true,
          color: { argb: c.sire === 'LISTO' ? 'FF1D4ED8' : 'FF6B7280' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // PDT 621
      if (colNum === 11) {
        cell.font = {
          size: 9,
          bold: true,
          color: { argb: c.pdt_621 === 'Declarado' ? 'FF16A34A' : 'FF6B7280' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ── Fila de totales ────────────────────────────────────────────────────────
  const totalRow = ws.getRow(clientes.length + 4);
  const totalDeuda = clientes.reduce((s, c) =>
    s + parseFloat(c.precio||0) - parseFloat(c.cobrado||0) - parseFloat(c.referido_monto||0), 0);

  ws.mergeCells(`A${clientes.length+4}:E${clientes.length+4}`);
  totalRow.getCell(1).value = 'TOTALES';
  totalRow.getCell(6).value = clientes.reduce((s,c) => s + parseFloat(c.precio||0), 0);
  totalRow.getCell(7).value = clientes.reduce((s,c) => s + parseFloat(c.cobrado||0), 0);
  totalRow.getCell(8).value = clientes.reduce((s,c) => s + parseFloat(c.referido_monto||0), 0);
  totalRow.getCell(9).value = totalDeuda;
  totalRow.height = 20;

  totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.fill = fill('FFE2E8F0');
    cell.font = { bold: true, size: 9, color: { argb: 'FF0F2344' } };
    cell.alignment = { horizontal: colNum >= 6 && colNum <= 9 ? 'right' : 'center', vertical: 'middle' };
    cell.border = border;
    if (colNum >= 6 && colNum <= 9) cell.numFmt = money;
  });

  // ── Descargar ──────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Control_${mesNombre}_${anio}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
