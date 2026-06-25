import { FiMove } from 'react-icons/fi';
import Pagination from '../common/Pagination/Pagination';
import EditableCell from './EditableCell';

const ControlClientsTable = ({
  clients,
  loading,
  pagination,
  reordering,
  draggedClientId,
  dragOverClientId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  onUpdateField,
  onPageChange,
}) => (
  <>
    <div className="ctrl-table-wrapper">
      <table className="ctrl-table">
        <thead>
          <tr>
            <th>#</th>
            <th>RUC</th>
            <th>NOMBRE</th>
            <th>REGIMEN</th>
            <th>PAGO</th>
            <th>PRECIO</th>
            <th>COBRADO</th>
            <th>REFERIDO</th>
            <th>DEUDA</th>
            <th>SIRE</th>
            <th>PDT 621</th>
            <th>OBSERVACIONES</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="12" className="ctrl-empty">Cargando...</td>
            </tr>
          ) : clients.length === 0 ? (
            <tr>
              <td colSpan="12" className="ctrl-empty">No hay clientes</td>
            </tr>
          ) : (
            clients.map((client, index) => {
              const debt =
                Number(client.precio || 0) -
                Number(client.cobrado || 0) -
                Number(client.referido_monto || 0);

              return (
                <tr
                  key={client.id}
                  className={[
                    draggedClientId === String(client.id) ? 'ctrl-row-dragging' : '',
                    dragOverClientId === String(client.id) ? 'ctrl-row-drag-over' : '',
                  ].filter(Boolean).join(' ')}
                  onDragOver={(event) => onDragOver(event, client.id)}
                  onDragLeave={() => onDragLeave(client.id)}
                  onDrop={(event) => onDrop(event, client.id)}
                >
                  <td className="ctrl-num">
                    <div className="ctrl-order-cell">
                      <span
                        className="ctrl-drag-handle"
                        draggable={!reordering}
                        title="Arrastrar para cambiar el orden"
                        onDragStart={(event) => onDragStart(event, client.id)}
                        onDragEnd={onDragEnd}
                      >
                        <FiMove />
                      </span>
                      <span>
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </span>
                    </div>
                  </td>

                  <td className="ctrl-ruc">{client.ruc}</td>
                  <td className="ctrl-name">
                    <span>{client.nombres} {client.apellidos}</span>
                    {client.es_nuevo && (
                      <span className="ctrl-new-client-tag">Nuevo</span>
                    )}
                  </td>
                  <td>{client.regimen}</td>
                  <td>
                    <select
                      className={`ctrl-select ${client.pago === 'SI' ? 'green' : 'red'}`}
                      value={client.pago}
                      onChange={(event) => onUpdateField(client.id, 'pago', event.target.value)}
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td>
                    <EditableCell
                      type="number"
                      value={client.precio}
                      onChange={(value) => onUpdateField(client.id, 'precio', value)}
                      className="ctrl-num-cell"
                    />
                  </td>
                  <td>
                    <EditableCell
                      type="number"
                      value={client.cobrado}
                      onChange={(value) => onUpdateField(client.id, 'cobrado', value)}
                      className="ctrl-num-cell"
                    />
                  </td>
                  <td>
                    <EditableCell
                      type="number"
                      value={client.referido_monto}
                      onChange={(value) => onUpdateField(client.id, 'referido_monto', value)}
                      className="ctrl-num-cell"
                    />
                  </td>
                  <td>
                    <span className={`ctrl-deuda ${debt > 0 ? 'red' : debt < 0 ? 'green' : ''}`}>
                      {debt.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`ctrl-select ${client.sire === 'LISTO' ? 'blue' : ''}`}
                      value={client.sire}
                      onChange={(event) => onUpdateField(client.id, 'sire', event.target.value)}
                    >
                      <option value="LISTO">LISTO</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className={`ctrl-select ${client.pdt_621 === 'Declarado' ? 'green' : ''}`}
                      value={client.pdt_621}
                      onChange={(event) => onUpdateField(client.id, 'pdt_621', event.target.value)}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Declarado">Declarado</option>
                    </select>
                  </td>
                  <td className="ctrl-obs-cell">
                    <EditableCell
                      value={client.observaciones}
                      onChange={(value) => onUpdateField(client.id, 'observaciones', value)}
                      className="ctrl-obs"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={onPageChange}
    />
  </>
);

export default ControlClientsTable;
