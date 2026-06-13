import { useCallback, useEffect, useState } from 'react';
import { FiEye } from 'react-icons/fi';

import SearchInput from '../../components/common/SearchInput/SearchInput';
import Pagination from '../../components/common/Pagination/Pagination';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';

import { useDebounce } from '../../hooks/useDebounce';

import {
  getRetiredClientsRequest,
  getRetiredClientByIdRequest,
} from '../../services/clients.service';

import './RetiredClients.css';

const RetiredClients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  const [selectedClient, setSelectedClient] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchRetiredClients = useCallback(async ({
    page = 1,
    searchValue = debouncedSearch,
  } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await getRetiredClientsRequest({
        search: searchValue,
        page,
        limit: pagination.limit,
      });

      setClients(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error al cargar clientes retirados'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.limit]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (nextPage) => {
    fetchRetiredClients({
      page: nextPage,
      searchValue: debouncedSearch,
    });
  };

  const handleOpenDetail = async (clientId) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);

      const response = await getRetiredClientByIdRequest(clientId);

      setSelectedClient(response);
    } catch (error) {
      alert(error.response?.data?.message || 'Error al obtener detalle');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedClient(null);
    setDetailModalOpen(false);
  };

  useEffect(() => {
    fetchRetiredClients({
      page: 1,
      searchValue: debouncedSearch,
    });
  }, [debouncedSearch, fetchRetiredClients]);

  return (
    <section className="retired-clients-page">
      <div className="retired-clients-header">
        <div>
          <h1>Clientes retirados</h1>
          <p>Consulta los clientes que dejaron el servicio.</p>
        </div>
      </div>

      <div className="retired-clients-card">
        <div className="retired-clients-toolbar">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre, apellido, RUC o DNI"
          />

          <span className="retired-clients-total">
            Total: {pagination.total}
          </span>
        </div>

        {error && (
          <div className="retired-clients-error">
            {error}
          </div>
        )}

        <div className="retired-clients-table-wrapper">
          <table className="retired-clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>RUC</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Tipo</th>
                <th>Régimen</th>
                <th>Fecha retiro</th>
                <th>Mes/Año</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    Cargando clientes retirados...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    No se encontraron clientes retirados
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <strong>
                        {client.nombres} {client.apellidos}
                      </strong>
                      <small>{client.correo || 'Sin correo'}</small>
                    </td>

                    <td>{client.ruc || '-'}</td>
                    <td>{client.dni || '-'}</td>
                    <td>{client.telefono || '-'}</td>
                    <td>{client.tipo_cliente || '-'}</td>
                    <td>{client.regimen || '-'}</td>
                    <td>
                      {client.fecha_retiro
                        ? new Date(client.fecha_retiro).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      {client.mes_retiro}/{client.anio_retiro}
                    </td>
                    <td>
                      <div className="retired-clients-actions">
                        <IconButton
                          title="Ver cliente retirado"
                          variant="view"
                          onClick={() => handleOpenDetail(client.id)}
                        >
                          <FiEye />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        open={detailModalOpen}
        title="Detalle del cliente retirado"
        onClose={closeModal}
        size="md"
        footer={
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        }
      >
        {loadingDetail ? (
          <p>Cargando detalle...</p>
        ) : selectedClient ? (
          <div className="retired-client-detail">
            <div>
              <span>Nombres</span>
              <strong>{selectedClient.nombres}</strong>
            </div>

            <div>
              <span>Apellidos</span>
              <strong>{selectedClient.apellidos || '-'}</strong>
            </div>

            <div>
              <span>RUC</span>
              <strong>{selectedClient.ruc || '-'}</strong>
            </div>

            <div>
              <span>DNI</span>
              <strong>{selectedClient.dni || '-'}</strong>
            </div>

            <div>
              <span>Correo</span>
              <strong>{selectedClient.correo || '-'}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{selectedClient.telefono || '-'}</strong>
            </div>

            <div>
              <span>Tipo de cliente</span>
              <strong>{selectedClient.tipo_cliente || '-'}</strong>
            </div>

            <div>
              <span>Régimen</span>
              <strong>{selectedClient.regimen || '-'}</strong>
            </div>

            <div>
              <span>Fecha de retiro</span>
              <strong>
                {selectedClient.fecha_retiro
                  ? new Date(selectedClient.fecha_retiro).toLocaleString()
                  : '-'}
              </strong>
            </div>

            <div>
              <span>Mes/Año retiro</span>
              <strong>
                {selectedClient.mes_retiro}/{selectedClient.anio_retiro}
              </strong>
            </div>

            <div className="retired-client-detail-full">
              <span>Dirección</span>
              <strong>{selectedClient.direccion || '-'}</strong>
            </div>

            <div className="retired-client-detail-full">
              <span>Motivo retiro</span>
              <strong>{selectedClient.motivo_retiro || '-'}</strong>
            </div>
          </div>
        ) : (
          <p>No hay datos para mostrar.</p>
        )}
      </Modal>
    </section>
  );
};

export default RetiredClients;
