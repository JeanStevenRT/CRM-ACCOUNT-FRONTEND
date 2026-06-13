import { formatMoney, getMonthName } from '../../../utils/formatters';
import './HistorySheet.css';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-PE');
};

const normalizeRows = (rows, minRows = 8) => {
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

const HistorySheet = ({ data , compact = false}) => {
  if (!data) {
    return null;
  }

  const { cliente, declaracion, ventas, compras, totales } = data;

  const normalizedSales = normalizeRows(ventas);
  const normalizedPurchases = normalizeRows(compras);

  return (
    <div className={compact ? 'history-sheet history-sheet-compact' : 'history-sheet'}>
      <div className="history-month-header">
        <h2>{getMonthName(declaracion.mes)}</h2>
        <span>{declaracion.anio}</span>
      </div>

      <section className="history-block">
        <h3>VENTAS</h3>

        <table className="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Serie</th>
              <th>Número</th>
              <th>Tasa</th>
              <th>Base</th>
              <th>IGV</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {normalizedSales.map((item, index) => (
              <tr key={`sale-${index}`}>
                <td>{formatDate(item.fecha)}</td>
                <td>{item.serie}</td>
                <td>{item.numero}</td>
                <td>{Number(item.tasa || 0)}%</td>
                <td>{Number(item.base || 0).toFixed(2)}</td>
                <td>{Number(item.igv || 0).toFixed(2)}</td>
                <td>{Number(item.total || 0).toFixed(2)}</td>
              </tr>
            ))}

            <tr className="history-total-row">
              <td colSpan="4">TOTAL</td>
              <td>{Number(totales.ventas_base || 0).toFixed(2)}</td>
              <td>{Number(totales.ventas_igv || 0).toFixed(2)}</td>
              <td>{Number(totales.ventas_total || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="history-block">
        <h3>COMPRAS</h3>

        <table className="history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Serie</th>
              <th>Número</th>
              <th>Tasa</th>
              <th>Base</th>
              <th>IGV</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {normalizedPurchases.map((item, index) => (
              <tr key={`purchase-${index}`}>
                <td>{formatDate(item.fecha)}</td>
                <td>{item.serie}</td>
                <td>{item.numero}</td>
                <td>{Number(item.tasa || 0)}%</td>
                <td>{Number(item.base || 0).toFixed(2)}</td>
                <td>{Number(item.igv || 0).toFixed(2)}</td>
                <td>{Number(item.total || 0).toFixed(2)}</td>
              </tr>
            ))}

            <tr className="history-total-row">
              <td colSpan="4">TOTAL</td>
              <td>{Number(totales.compras_base || 0).toFixed(2)}</td>
              <td>{Number(totales.compras_igv || 0).toFixed(2)}</td>
              <td>{Number(totales.compras_total || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="history-summary">
        <div className="history-client-data">
          <div>
            <span>RUC:</span>
            <strong>{cliente.ruc || '-'}</strong>
          </div>

          <div>
            <span>DNI:</span>
            <strong>{cliente.dni || '-'}</strong>
          </div>

          <div>
            <span>TLF:</span>
            <strong>{cliente.telefono || '-'}</strong>
          </div>

          <div>
            <span>NOMBRE:</span>
            <strong>{cliente.nombres} {cliente.apellidos}</strong>
          </div>

          <div>
            <span>CORREO:</span>
            <strong>{cliente.correo || '-'}</strong>
          </div>
        </div>

        <div className="history-tax-data">
          <div>
            <span>SIRE</span>
            <strong>{declaracion.sire ? 'Sí' : 'No'}</strong>
          </div>

          <div>
            <span>RÉGIMEN</span>
            <strong>{declaracion.regimen || '-'}</strong>
          </div>

          <div>
            <span>TASA IR</span>
            <strong>{declaracion.tasa_ir}%</strong>
          </div>

          <div>
            <span>TOTAL IGV</span>
            <strong>{formatMoney(totales.total_igv)}</strong>
          </div>

          <div>
            <span>TOTAL IR</span>
            <strong>{formatMoney(totales.total_ir)}</strong>
          </div>

          <div>
            <span>CRÉDITO FISCAL</span>
            <strong>{formatMoney(totales.credito_fiscal)}</strong>
          </div>
        </div>
      </section>

      <section className="history-observations">
        <h3>OBSERVACIONES</h3>
        <p>{declaracion.observaciones || 'Sin observaciones'}</p>
      </section>
    </div>
  );
};

export default HistorySheet;
