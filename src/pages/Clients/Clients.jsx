import { useCallback, useEffect, useState } from 'react';
import SearchInput from '../../components/common/SearchInput/SearchInput';
import Pagination from '../../components/common/Pagination/Pagination';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import ClientForm from '../../components/forms/ClientForm/ClientForm';

import { EyeIcon, EditIcon, TrashIcon } from '../../components/common/Icons/Icons';

import {
  getClientsRequest,
  createClientRequest,
  updateClientRequest,
  retireClientRequest,
} from '../../services/clients.service';

import { useDebounce } from '../../hooks/useDebounce';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedClient, setSelectedClient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [retireModalOpen, setRetireModalOpen] = useState(false);
  const [retireReason, setRetireReason] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchClients = useCallback(async ({ page = 1, searchValue = debouncedSearch } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await getClientsRequest({
        search: searchValue,
        page,
        limit: pagination.limit,
      });

      setClients(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar clientes');
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
    fetchClients({
      page: nextPage,
      searchValue: debouncedSearch,
    });
  };

  const openViewModal = (client) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const openRetireModal = (client) => {
    setSelectedClient(client);
    setRetireReason('');
    setRetireModalOpen(true);
  };

  const handleCreateClient = async (formData) => {
  try {
    setActionLoading(true);

    await createClientRequest(formData);

    closeModals();

    await fetchClients({
      page: 1,
      searchValue: debouncedSearch,
    });
  } catch (error) {
    alert(error.response?.data?.message || 'Error al crear cliente');
  } finally {
    setActionLoading(false);
  }
};

  const closeModals = () => {
    setSelectedClient(null);
    setCreateModalOpen(false);
    setViewModalOpen(false);
    setEditModalOpen(false);
    setRetireReason('');
    setRetireModalOpen(false);
  };

  const handleUpdateClient = async (formData) => {
    try {
      setActionLoading(true);

      await updateClientRequest(selectedClient.id, formData);

      closeModals();

      await fetchClients({
        page: pagination.page,
        searchValue: debouncedSearch,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRetire = async () => {
    try {
      setActionLoading(true);

      await retireClientRequest(selectedClient.id , {
        motivo_retiro: retireReason.trim() || 'Sin motivo especificado',
    });

      closeModals();

      await fetchClients({
        page: pagination.page,
        searchValue: debouncedSearch,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al retirar cliente');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchClients({
      page: 1,
      searchValue: debouncedSearch,
    });
  }, [debouncedSearch, fetchClients]);

  return (
    <section className="clients-page">
        <div className="clients-header">
            <div>
            <h1>Listar clientes</h1>
            <p>Gestiona los clientes activos del contador.</p>
            </div>

            <Button onClick={() => setCreateModalOpen(true)}>
            Nuevo cliente
            </Button>
        </div>

        <div className="clients-card">
            <div className="clients-toolbar">
            <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, apellido, RUC o DNI"
            />

            <div className="clients-summary">
                <span>Total : {pagination.total} Clientes</span>
                <span>Página {pagination.page} de {pagination.totalPages || 1}</span>
            </div>
            </div>

            {error && (
            <div className="clients-error">
                {error}
            </div>
            )}

            <div className="clients-table-wrapper">
            <table className="clients-table">
                <thead>
                <tr>
                    <th>Cliente</th>
                    <th>RUC</th>
                    <th>DNI</th>
                    <th>Teléfono</th>
                    <th>Tipo</th>
                    <th>Régimen</th>
                    <th>Acciones</th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                    <td colSpan="7" className="table-empty">
                        Cargando clientes...
                    </td>
                    </tr>
                ) : clients.length === 0 ? (
                    <tr>
                    <td colSpan="7" className="table-empty">
                        No se encontraron clientes
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
                        <div className="clients-actions">
                            <IconButton
                            title="Ver cliente"
                            variant="view"
                            onClick={() => openViewModal(client)}
                            >
                            <EyeIcon />
                            </IconButton>

                            <IconButton
                            title="Editar cliente"
                            variant="edit"
                            onClick={() => openEditModal(client)}
                            >
                            <EditIcon />
                            </IconButton>

                            <IconButton
                            title="Retirar cliente"
                            variant="danger"
                            onClick={() => openRetireModal(client)}
                            >
                            <TrashIcon />
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
        open={createModalOpen}
        title="Nuevo cliente"
        onClose={closeModals}
        size="lg">
            <ClientForm
                submitText="Crear cliente"
                loading={actionLoading}
                onSubmit={handleCreateClient}
            />
        </Modal>
        <Modal
            open={viewModalOpen}
            title="Datos del cliente"
            onClose={closeModals}
            size="md"
            footer={
            <Button variant="secondary" onClick={closeModals}>
                Cerrar
            </Button>
        }>
        {selectedClient && (
          <div className="client-detail">
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

            <div className="client-detail-full">
              <span>Dirección</span>
              <strong>{selectedClient.direccion || '-'}</strong>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={editModalOpen}
        title="Editar cliente"
        onClose={closeModals}
        size="lg"
      >
        {selectedClient && (
          <ClientForm
            initialValues={selectedClient}
            submitText="Actualizar cliente"
            loading={actionLoading}
            onSubmit={handleUpdateClient}
          />
        )}
      </Modal>

      <Modal
            open={retireModalOpen}
            title="Confirmar retiro"
            onClose={closeModals}
            size="sm"
            footer={
            <>
                <Button
                    variant="secondary"
                    onClick={closeModals}
                    disabled={actionLoading}>
                    Cancelar
                </Button>

                <Button
                    variant="danger"
                    onClick={handleConfirmRetire}
                    disabled={actionLoading}>
                    {actionLoading ? 'Retirando...' : 'Sí, retirar'}
                </Button>
            </>
        }>
        {selectedClient && (
            <div className="retire-content">
            <p className="retire-message">
                ¿Seguro que deseas retirar a{' '}
                <strong>
                {selectedClient.nombres} {selectedClient.apellidos}
                </strong>
                ? El cliente pasará a la lista de retirados y dejará de aparecer como activo.
            </p>

            <label className="retire-reason-field">
                Motivo de retiro
                <textarea
                value={retireReason}
                onChange={(event) => setRetireReason(event.target.value)}
                placeholder="Ejemplo: dejó de tomar el servicio, cambió de contador, negocio cerrado..."
                rows="4"
                />
            </label>
            </div>
        )}
        </Modal>
    </section>
  );
};

export default Clients;
