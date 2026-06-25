import { FiTrash2 } from 'react-icons/fi';
import EditableCell from './EditableCell';

const ControlReferralsTable = ({
  referrals,
  onUpdate,
  onDelete,
}) => (
  <div className="ctrl-table-wrapper">
    <table className="ctrl-table ctrl-ref-table">
      <thead>
        <tr>
          <th className="ref-th-num">#</th>
          <th className="ref-th-green">REFERIDO</th>
          <th className="ref-th-green">RUC</th>
          <th className="ref-th-green">PAGO S/</th>
          <th className="ref-th-arrow">-&gt;</th>
          <th className="ref-th-yellow">SPONSOR</th>
          <th className="ref-th-yellow">DESCUENTO</th>
          <th className="ref-th-yellow">ESTADO</th>
          <th className="ref-th-yellow ref-th-del"></th>
        </tr>
      </thead>

      <tbody>
        {referrals.length === 0 ? (
          <tr>
            <td colSpan="9" className="ctrl-empty">
              Sin referidos este mes. Usa <strong>+ Referido</strong> para agregar.
            </td>
          </tr>
        ) : (
          referrals.map((referral, index) => {
            const collected = referral.cobrado === 'SI';

            return (
              <tr
                key={referral.id}
                className={`ref-row ${collected ? 'ref-row-cobrado' : ''}`}
              >
                <td className="ref-td-num">{index + 1}</td>
                <td className="ref-td-green ref-td-name">
                  {referral.referido_nombre || referral.referido_nombre_real || '-'}
                </td>
                <td className="ref-td-green ref-td-ruc">
                  {referral.referido_ruc || '-'}
                </td>
                <td className="ref-td-green">
                  <EditableCell
                    type="number"
                    value={Number(referral.referido_pago || 0).toFixed(2)}
                    onChange={(value) =>
                      onUpdate(referral.id, 'referido_pago', Number(value) || 0)
                    }
                    className="ctrl-num-cell"
                  />
                </td>
                <td className="ref-td-arrow">-&gt;</td>
                <td className="ref-td-yellow ref-td-name">
                  {referral.sponsor_nombre || referral.sponsor_nombre_real || '-'}
                </td>
                <td className="ref-td-yellow">
                  <EditableCell
                    type="number"
                    value={Number(referral.descuento || 0).toFixed(2)}
                    onChange={(value) =>
                      onUpdate(referral.id, 'descuento', Number(value) || 0)
                    }
                    className="ctrl-num-cell"
                  />
                </td>
                <td className="ref-td-yellow">
                  <select
                    className={`ctrl-select ${collected ? 'green' : 'orange'}`}
                    value={referral.cobrado}
                    onChange={(event) =>
                      onUpdate(referral.id, 'cobrado', event.target.value)
                    }
                  >
                    <option value="NO">Pendiente</option>
                    <option value="SI">Cobrado</option>
                  </select>
                </td>
                <td className="ref-td-yellow">
                  <button
                    type="button"
                    className="ref-delete-btn"
                    title="Eliminar referido"
                    aria-label="Eliminar referido"
                    onClick={() => onDelete(referral.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

export default ControlReferralsTable;
