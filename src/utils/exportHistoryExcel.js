import ExcelJS from 'exceljs';
import { getMonthName } from './formatters';

const normalizeRows = (rows = [], minRows = 8) => {
  const emptyRows = Array.from({ length: Math.max(minRows - rows.length, 0) }, () => ({
    fecha: '',
    serie: '',
    numero: '',
    ruc: '',
    tasa: 18,
    base: 0,
    igv: 0,
    total: 0,
  }));

  return [...rows, ...emptyRows];
};

const formatDate = (date) => {
  if (!date) return '';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed;
};

const currencyFormat = '#,##0.00';

const borders = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};

const fill = (argb) => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
});

const applyRangeBorder = (worksheet, rowNumber, fromCol = 1, toCol = 7) => {
  for (let col = fromCol; col <= toCol; col += 1) {
    worksheet.getCell(rowNumber, col).border = borders;
  }
};

const styleTitleRow = (worksheet, rowNumber, fillColor, fontColor = 'FFFFFFFF') => {
  const row = worksheet.getRow(rowNumber);
  row.height = 22;

  row.eachCell((cell) => {
    cell.fill = fill(fillColor);
    cell.font = {
      bold: true,
      color: { argb: fontColor },
      size: 12,
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    cell.border = borders;
  });
};

const addTable = ({ worksheet, title, rows, totals, startRow, theme }) => {
  worksheet.mergeCells(startRow, 1, startRow, 7);
  worksheet.getCell(startRow, 1).value = title;
  styleTitleRow(worksheet, startRow, theme.sectionFill, theme.sectionFont);

  const headerRow = worksheet.getRow(startRow + 1);
  headerRow.values = ['Fecha', 'Serie', 'Numero', 'Tasa', 'Base', 'IGV', 'Total'];
  headerRow.height = 20;

  headerRow.eachCell((cell) => {
    cell.fill = fill(theme.headerFill);
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 9,
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    cell.border = borders;
  });

  const normalizedRows = normalizeRows(rows);

  normalizedRows.forEach((item, index) => {
    const rowNumber = startRow + 2 + index;
    const row = worksheet.getRow(rowNumber);
    row.values = [
      formatDate(item.fecha),
      item.serie || '',
      item.numero || '',
      Number(item.tasa || 0) / 100,
      Number(item.base || 0),
      Number(item.igv || 0),
      Number(item.total || 0),
    ];
    row.height = 19;

    row.eachCell((cell, colNumber) => {
      cell.fill = fill(index % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC');
      cell.border = borders;
      cell.font = {
        size: 9,
        bold: colNumber >= 5,
        color: { argb: 'FF0F172A' },
      };
      cell.alignment = {
        horizontal: colNumber >= 5 ? 'right' : 'center',
        vertical: 'middle',
      };

      if (colNumber === 1 && cell.value instanceof Date) {
        cell.numFmt = 'dd/mm/yyyy';
      }

      if (colNumber === 4) {
        cell.numFmt = '0.00%';
      }

      if (colNumber >= 5) {
        cell.numFmt = currencyFormat;
      }
    });
  });

  const totalRowNumber = startRow + 2 + normalizedRows.length;
  worksheet.mergeCells(totalRowNumber, 1, totalRowNumber, 4);

  const totalRow = worksheet.getRow(totalRowNumber);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(5).value = Number(totals.base || 0);
  totalRow.getCell(6).value = Number(totals.igv || 0);
  totalRow.getCell(7).value = Number(totals.total || 0);
  totalRow.height = 20;

  for (let col = 1; col <= 7; col += 1) {
    const cell = totalRow.getCell(col);
    cell.fill = fill('FFE2E8F0');
    cell.font = {
      bold: true,
      color: { argb: 'FF0F2344' },
      size: 9,
    };
    cell.alignment = {
      horizontal: col >= 5 ? 'right' : 'center',
      vertical: 'middle',
    };
    cell.border = borders;

    if (col >= 5) {
      cell.numFmt = currencyFormat;
    }
  }

  return totalRowNumber + 1;
};

const addPairRow = (worksheet, rowNumber, leftLabel, leftValue, rightLabel, rightValue, highlight = false) => {
  worksheet.mergeCells(rowNumber, 1, rowNumber, 3);
  worksheet.mergeCells(rowNumber, 4, rowNumber, 7);

  const leftCell = worksheet.getCell(rowNumber, 1);
  const rightCell = worksheet.getCell(rowNumber, 4);
  leftCell.value = `${leftLabel}: ${leftValue || '-'}`;
  rightCell.value = `${rightLabel}: ${rightValue || '-'}`;

  [leftCell, rightCell].forEach((cell) => {
    cell.fill = fill(highlight ? 'FFFFE7C2' : 'FFF8FAFC');
    cell.font = {
      bold: true,
      color: { argb: highlight ? 'FF9A3412' : 'FF0F2344' },
      size: 9,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
    };
  });

  applyRangeBorder(worksheet, rowNumber);
  worksheet.getRow(rowNumber).height = 20;
};

const buildHistorySheet = (workbook, historyItem) => {
  const { cliente, declaracion, ventas, compras, totales } = historyItem;
  const sheetName = `${getMonthName(declaracion.mes)} ${declaracion.anio}`.slice(0, 31);
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = [
    { width: 13 },
    { width: 13 },
    { width: 14 },
    { width: 14 },
    { width: 13 },
    { width: 13 },
    { width: 13 },
  ];

  worksheet.views = [{ showGridLines: false }];

  worksheet.mergeCells(1, 1, 1, 7);
  worksheet.getCell(1, 1).value = `${getMonthName(declaracion.mes).toUpperCase()}    ${declaracion.anio}`;
  worksheet.getRow(1).height = 25;
  styleTitleRow(worksheet, 1, 'FF1D4ED8');

  let nextRow = addTable({
    worksheet,
    title: 'VENTAS',
    rows: ventas,
    totals: {
      base: totales.ventas_base,
      igv: totales.ventas_igv,
      total: totales.ventas_total,
    },
    startRow: 3,
    theme: {
      sectionFill: 'FFBFDBFE',
      sectionFont: 'FF0F3C7A',
      headerFill: 'FF0F3C7A',
    },
  });

  nextRow = addTable({
    worksheet,
    title: 'COMPRAS',
    rows: compras,
    totals: {
      base: totales.compras_base,
      igv: totales.compras_igv,
      total: totales.compras_total,
    },
    startRow: nextRow + 1,
    theme: {
      sectionFill: 'FFBBF7D0',
      sectionFont: 'FF166534',
      headerFill: 'FF166534',
    },
  });

  addPairRow(worksheet, nextRow + 1, 'RUC', cliente.ruc, 'DNI', cliente.dni);
  addPairRow(worksheet, nextRow + 2, 'TLF', cliente.telefono, 'NOMBRE', `${cliente.nombres} ${cliente.apellidos || ''}`.trim());
  addPairRow(worksheet, nextRow + 3, 'CORREO', cliente.correo, '', '');
  addPairRow(worksheet, nextRow + 4, 'SIRE', declaracion.sire ? 'Si' : 'No', 'REGIMEN', declaracion.regimen);
  addPairRow(worksheet, nextRow + 5, 'TASA IR', `${declaracion.tasa_ir || 0}%`, 'TOTAL IGV', Number(totales.total_igv || 0), true);
  addPairRow(worksheet, nextRow + 6, 'TOTAL IR', Number(totales.total_ir || 0), 'CREDITO FISCAL', Number(totales.credito_fiscal || 0), true);

  [worksheet.getCell(nextRow + 5, 4), worksheet.getCell(nextRow + 6, 1), worksheet.getCell(nextRow + 6, 4)].forEach((cell) => {
    cell.numFmt = currencyFormat;
  });

  const observationTitleRow = nextRow + 8;
  worksheet.mergeCells(observationTitleRow, 1, observationTitleRow, 7);
  worksheet.getCell(observationTitleRow, 1).value = 'OBSERVACIONES';
  styleTitleRow(worksheet, observationTitleRow, 'FF0F2344');

  const observationRow = observationTitleRow + 1;
  worksheet.mergeCells(observationRow, 1, observationRow, 7);
  worksheet.getCell(observationRow, 1).value = declaracion.observaciones || 'Sin observaciones';
  worksheet.getCell(observationRow, 1).fill = fill('FFF8FAFC');
  worksheet.getCell(observationRow, 1).font = {
    size: 9,
    color: { argb: 'FF374151' },
  };
  worksheet.getCell(observationRow, 1).alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };
  worksheet.getRow(observationRow).height = 34;
  applyRangeBorder(worksheet, observationRow);
};

const saveWorkbook = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportHistoryMonthToExcel = async ({ historyItem, fileName }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Account CRM';
  workbook.created = new Date();

  buildHistorySheet(workbook, historyItem);

  await saveWorkbook(workbook, fileName);
};

export const exportHistoryListToExcel = async ({ historyList, fileName }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Account CRM';
  workbook.created = new Date();

  historyList.forEach((historyItem) => {
    buildHistorySheet(workbook, historyItem);
  });

  await saveWorkbook(workbook, fileName);
};
