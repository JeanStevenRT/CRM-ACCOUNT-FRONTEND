import * as XLSX from 'xlsx';

/**
 * Normaliza un string de encabezado para comparación flexible.
 */
const norm = (v) =>
  String(v || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Mapeo de alias de columnas del Excel al campo interno
const ALIAS = {
  ruc:          ['ruc'],
  pago:         ['pago', 'pago?', 'pago si no', 'pago s n'],
  precio:       ['precio', 'precio honorario', 'honorario'],
  cobrado:      ['cobrado', 'pago2', 'pagado', 'monto cobrado'],
  referido_monto:['referido', 'referido monto', 'desc referido', 'descuento referido'],
  sire:         ['sire', 'estado sire'],
  pdt_621:      ['pdt', 'pdt 621', 'pdt621', 'declaracion', 'declarado'],
  observaciones:['observaciones', 'obs', 'notas', 'nota'],
};

const findCol = (headers, field) => {
  const aliases = ALIAS[field];
  return headers.find(h => aliases.includes(norm(h)));
};

const parsePago = (v) => {
  const s = String(v || '').trim().toUpperCase();
  return s === 'SI' || s === 'SÍ' || s === '1' || s === 'TRUE' ? 'SI' : 'NO';
};

const parseSire = (v) => {
  const s = String(v || '').trim().toUpperCase();
  return s === 'LISTO' || s === 'SI' || s === 'SÍ' || s === '1' ? 'LISTO' : 'Pendiente';
};

const parsePdt = (v) => {
  const s = String(v || '').trim();
  const up = s.toUpperCase();
  return up === 'DECLARADO' || up === 'SI' || up === 'SÍ' || up === '1' ? 'Declarado' : 'Pendiente';
};

const parseNum = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

/**
 * Lee un archivo Excel (.xlsx/.xls) y devuelve un array de filas parseadas.
 * Cada fila: { ruc, pago, precio, cobrado, referido_monto, sire, pdt_621, observaciones }
 *
 * Soporta dos formatos:
 *  A) Hoja con nombre del mes (ej: "FEBRERO") – formato DATA RIDERS
 *  B) Primera hoja válida con columna RUC
 *
 * @param {File} file
 * @param {number} mes  (1–12)
 * @returns {Promise<Array>}
 */
export const parseControlExcel = (file, mes) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });

        const MESES_NAMES = [
          'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
          'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE',
        ];
        const mesName = MESES_NAMES[mes - 1];

        // Buscar hoja: primero por nombre de mes, luego la primera hoja
        let sheetName =
          wb.SheetNames.find(n => n.trim().toUpperCase() === mesName) ||
          wb.SheetNames[0];

        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rows.length) {
          reject(new Error(`La hoja "${sheetName}" está vacía.`));
          return;
        }

        const headers = Object.keys(rows[0]);
        const colRuc  = findCol(headers, 'ruc');

        if (!colRuc) {
          reject(new Error('No se encontró la columna RUC en el Excel. Verifica el formato.'));
          return;
        }

        const colPago  = findCol(headers, 'pago');
        const colPrec  = findCol(headers, 'precio');
        const colCob   = findCol(headers, 'cobrado');
        const colRef   = findCol(headers, 'referido_monto');
        const colSire  = findCol(headers, 'sire');
        const colPdt   = findCol(headers, 'pdt_621');
        const colObs   = findCol(headers, 'observaciones');

        const parsed = rows
          .map(row => ({
            ruc:            String(row[colRuc] || '').trim(),
            pago:           colPago  ? parsePago(row[colPago])        : null,
            precio:         colPrec  ? parseNum(row[colPrec])         : null,
            cobrado:        colCob   ? parseNum(row[colCob])          : null,
            referido_monto: colRef   ? parseNum(row[colRef])          : null,
            sire:           colSire  ? parseSire(row[colSire])        : null,
            pdt_621:        colPdt   ? parsePdt(row[colPdt])          : null,
            observaciones:  colObs   ? String(row[colObs] || '').trim() : null,
          }))
          .filter(r => r.ruc && r.ruc.length >= 8); // ignorar filas sin RUC válido

        resolve({ filas: parsed, hoja: sheetName });
      } catch (err) {
        reject(new Error('Error leyendo el Excel: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
};
