import * as XLSX from 'xlsx';

const normalizeKey = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ');
};

const columnAliases = {
  fecha: ['fecha', 'fecha emision', 'fecha de emision', 'fec emision', 'emision'],
  serie: ['serie', 'serie comprobante', 'serie del comprobante', 'serie del cdp', 'serie de cdp', 'serie cp'],
  numero: ['numero', 'nro', 'correlativo', 'numero comprobante', 'nro comprobante', 'nro cp', 'numero cp', 'numero del cdp'],
  tasa: ['tasa', 'tasa igv', 'igv %', 'porcentaje igv', 'porcentaje'],
  base: [
    'base',
    'base imponible',
    'valor venta',
    'valor de venta',
    'monto base',
    'gravada',
    'bi gravada',
    'bi gravada dg',
    'base imponible gravada',
    'operacion gravada',
    'importe base',
  ],
  igv: ['igv', 'igv ipm', 'impuesto', 'monto igv', 'importe igv'],
  total: ['total', 'importe total', 'monto total', 'total comprobante'],
  comprobante: ['comprobante', 'numero de comprobante', 'documento', 'serie numero'],
};

const findColumn = (headers, field) => {
  const aliases = columnAliases[field];

  return headers.find((header) => aliases.includes(normalizeKey(header)));
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  const cleaned = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '');

  if (!cleaned) return 0;

  const commaIndex = cleaned.lastIndexOf(',');
  const dotIndex = cleaned.lastIndexOf('.');

  if (commaIndex > dotIndex) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }

  return Number(cleaned.replace(/,/g, '')) || 0;
};

const excelDateToIso = (value) => {
  if (!value) return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      const month = String(parsed.m).padStart(2, '0');
      const day = String(parsed.d).padStart(2, '0');
      return `${parsed.y}-${month}-${day}`;
    }
  }

  const text = String(value).trim();
  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (slashMatch) {
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    const month = slashMatch[2].padStart(2, '0');
    const day = slashMatch[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  return '';
};

const splitComprobante = (value) => {
  const text = String(value || '').trim();
  const match = text.match(/^([A-Za-z0-9]+)[-\s]+([A-Za-z0-9]+)$/);

  if (!match) {
    return {
      serie: '',
      numero: text,
    };
  }

  return {
    serie: match[1],
    numero: match[2],
  };
};

const inferRate = ({ tasa, base, igv, total }) => {
  const parsedRate = parseNumber(tasa);

  if ([0, 10.5, 18].includes(parsedRate)) {
    return parsedRate;
  }

  if (base > 0 && igv >= 0) {
    const rate = Math.round((igv / base) * 1000) / 10;

    if (Math.abs(rate - 18) <= 0.3) return 18;
    if (Math.abs(rate - 10.5) <= 0.3) return 10.5;
    if (Math.abs(rate) <= 0.3) return 0;
  }

  if (base > 0 && total > 0) {
    const rate = Math.round(((total - base) / base) * 1000) / 10;

    if (Math.abs(rate - 18) <= 0.3) return 18;
    if (Math.abs(rate - 10.5) <= 0.3) return 10.5;
    if (Math.abs(rate) <= 0.3) return 0;
  }

  return 18;
};

const findHeaderRow = (matrix, type) => {
  const targetSection = type === 'purchases' ? 'compras' : type === 'sales' ? 'ventas' : '';
  let sectionFound = !targetSection;

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] || [];
    const normalizedCells = row.map((cell) => normalizeKey(cell));

    if (targetSection && normalizedCells.includes(targetSection)) {
      sectionFound = true;
      continue;
    }

    if (!sectionFound) continue;

    const hasFecha = normalizedCells.some((cell) => columnAliases.fecha.includes(cell));
    const hasBase = normalizedCells.some((cell) => columnAliases.base.includes(cell));
    const hasTotal = normalizedCells.some((cell) => columnAliases.total.includes(cell));

    if (hasFecha && hasBase && hasTotal) {
      return rowIndex;
    }
  }

  return -1;
};

const mapColumnsFromHeader = (headerRow) => {
  const columns = {};

  Object.keys(columnAliases).forEach((field) => {
    columns[field] = headerRow.findIndex((header) => columnAliases[field].includes(normalizeKey(header)));
  });

  return columns;
};

const readCell = (row, index) => {
  if (index < 0) return '';
  return row[index] ?? '';
};

const parseMatrixRows = ({ matrix, headerRowIndex, type }) => {
  const headers = matrix[headerRowIndex] || [];
  const columns = mapColumnsFromHeader(headers);
  const parsedRows = [];
  const invalidRows = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] || [];
    const firstCell = normalizeKey(row[0]);

    if (firstCell === 'total') break;

    if (
      row.some((cell) => normalizeKey(cell) === 'ventas' || normalizeKey(cell) === 'compras') &&
      rowIndex > headerRowIndex + 1
    ) {
      break;
    }

    const comprobante = columns.comprobante >= 0 ? splitComprobante(readCell(row, columns.comprobante)) : null;
    const serie = String(readCell(row, columns.serie) || comprobante?.serie || '').trim();
    const numero = String(readCell(row, columns.numero) || comprobante?.numero || '').trim();
    const igv = parseNumber(readCell(row, columns.igv));
    const total = parseNumber(readCell(row, columns.total));
    const parsedBase = parseNumber(readCell(row, columns.base));
    const base = parsedBase > 0 ? parsedBase : Math.max(total - igv, 0);
    const tasa = inferRate({
      tasa: readCell(row, columns.tasa),
      base,
      igv,
      total,
    });

    const parsedRow = {
      fecha: excelDateToIso(readCell(row, columns.fecha)),
      serie,
      numero,
      tasa: String(tasa),
      base: String(base),
      sourceRow: rowIndex + 1,
    };

    if (!parsedRow.fecha && !parsedRow.serie && !parsedRow.numero && base === 0) {
      continue;
    }

    if (base <= 0) {
      invalidRows.push({
        ...parsedRow,
        reason: `Base no valida o no encontrada${type ? ` en ${type}` : ''}`,
      });
      continue;
    }

    parsedRows.push(parsedRow);
  }

  return {
    rows: parsedRows,
    invalidRows,
  };
};

export const parseSalesPurchasesSpreadsheet = async (file, type = '', preferredSheetName = '') => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, {
    type: 'array',
    cellDates: true,
  });

  const normalizedPreferredSheet = normalizeKey(preferredSheetName);
  const sheetName = normalizedPreferredSheet
    ? workbook.SheetNames.find((name) => normalizeKey(name).includes(normalizedPreferredSheet)) || workbook.SheetNames[0]
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  const headerRowIndex = findHeaderRow(matrix, type);

  if (headerRowIndex >= 0) {
    const parsed = parseMatrixRows({
      matrix,
      headerRowIndex,
      type,
    });

    return {
      ...parsed,
      sheetName,
    };
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    return {
      rows: [],
      invalidRows: [],
      sheetName,
    };
  }

  const headers = Object.keys(rows[0]);
  const columns = {
    fecha: findColumn(headers, 'fecha'),
    serie: findColumn(headers, 'serie'),
    numero: findColumn(headers, 'numero'),
    tasa: findColumn(headers, 'tasa'),
    base: findColumn(headers, 'base'),
    igv: findColumn(headers, 'igv'),
    total: findColumn(headers, 'total'),
    comprobante: findColumn(headers, 'comprobante'),
  };

  const parsedRows = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const comprobante = columns.comprobante ? splitComprobante(row[columns.comprobante]) : null;
    const serie = String(columns.serie ? row[columns.serie] : comprobante?.serie || '').trim();
    const numero = String(columns.numero ? row[columns.numero] : comprobante?.numero || '').trim();
    const igv = parseNumber(columns.igv ? row[columns.igv] : '');
    const total = parseNumber(columns.total ? row[columns.total] : '');
    const parsedBase = parseNumber(columns.base ? row[columns.base] : '');
    const base = parsedBase > 0 ? parsedBase : Math.max(total - igv, 0);
    const tasa = inferRate({
      tasa: columns.tasa ? row[columns.tasa] : '',
      base,
      igv,
      total,
    });

    const parsedRow = {
      fecha: excelDateToIso(columns.fecha ? row[columns.fecha] : ''),
      serie,
      numero,
      tasa: String(tasa),
      base: String(base),
      sourceRow: index + 2,
    };

    if (!parsedRow.fecha && !parsedRow.serie && !parsedRow.numero && base === 0) {
      return;
    }

    if (base <= 0) {
      invalidRows.push({
        ...parsedRow,
        reason: 'Base no valida o no encontrada',
      });
      return;
    }

    parsedRows.push(parsedRow);
  });

  return {
    rows: parsedRows,
    invalidRows,
    sheetName,
  };
};
