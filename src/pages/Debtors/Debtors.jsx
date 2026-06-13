import { useCallback, useEffect, useState } from 'react';
import { FiEye, FiCheckCircle } from 'react-icons/fi';

import SearchInput from '../../components/common/SearchInput/SearchInput';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import Pagination from '../../components/common/Pagination/Pagination';

import { getClientsRequest } from '../../services/clients.service';

import {
  getDebtorsRequest,
  getDebtorByIdRequest,
  payDebtRequest,
} from '../../services/debtors.service';

import { useDebounce } from '../../hooks/useDebounce';
import { formatMoney, getMonthName } from '../../utils/formatters';

import './Debtors.css';

const monthOptions = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const currentYear = String(new Date().getFullYear());

const Debtors = () => {
  const [debtors, setDebtors] = useState([]);

  const [search, setSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const debouncedClientSearch = useDebounce(search, 400);

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);

      const response = await getClientsRequest({
        search: debouncedClientSearch,
        page: 1,
        limit: 5,
      });

      setClientResults(response.data);
    } catch {
      setClientResults([]);
    } finally {
      setLoadingClients(false);
    }
  }, [debouncedClientSearch]);

  const fetchDebtors = useCallback(async ({
    page = 1,  
    clienteIdValue = '',
    searchValue = '',
    monthValue = '',
    yearValue = currentYear,
  } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await getDebtorsRequest({
        clienteId: clienteIdValue,
        anio: yearValue,
        mes: monthValue,
        search: clienteIdValue ? '' : searchValue,
        page,
        limit: pagination.limit,
      });

      setDebtors(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar deudores');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setSelectedClient(null);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearch(`${client.nombres} ${client.apellidos || ''}`);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

 const handleSearchDebts = () => {
  fetchDebtors({
    page: 1,
    clienteIdValue: selectedClient?.id || '',
    searchValue: search,
    monthValue: selectedMonth,
    yearValue: selectedYear,
  });
};
    const handleClearFilters = () => {
    setSearch('');
    setSelectedClient(null);
    setSelectedMonth('');
    setSelectedYear(currentYear);

    fetchDebtors({
        page: 1,
        clienteIdValue: '',
        searchValue: '',
        monthValue: '',
        yearValue: currentYear,
    });
    };

  const handlePageChange = (nextPage) => {
  fetchDebtors({
    page: nextPage,
    clienteIdValue: selectedClient?.id || '',
    searchValue: search,
    monthValue: selectedMonth,
    yearValue: selectedYear,
  });
};

  const handleOpenDetail = async (id) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);

      const response = await getDebtorByIdRequest(id);
      setSelectedDebtor(response);
    } catch (error) {
      alert(error.response?.data?.message || 'Error al obtener deudor');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenPayModal = (debtor) => {
    setSelectedDebtor(debtor);
    setPayModalOpen(true);
  };

  const closeModals = () => {
    setSelectedDebtor(null);
    setDetailModalOpen(false);
    setPayModalOpen(false);
  };

  const handleConfirmPay = async () => {
    try {
      setActionLoading(true);

      await payDebtRequest(selectedDebtor.id);

      closeModals();

      await fetchDebtors({
            page: pagination.page,
            clienteIdValue: selectedClient?.id || '',
            searchValue: search,
            monthValue: selectedMonth,
            yearValue: selectedYear,
        });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al marcar deuda como pagada');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchDebtors({
      page: 1,
      searchValue: '',
      monthValue: '',
      yearValue: currentYear,
    });
  }, [fetchDebtors]);

  return (
    <section className="debtors-page">
      <div className="debtors-header">
        <div>
          <h1>Deudores</h1>
          <p>Consulta clientes con deuda pendiente por mes.</p>
        </div>
      </div>

      <div className="debtors-card">
        <div className="debtors-toolbar">
          <div className="debtors-filters">
            <div className="debtors-client-search">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar cliente, RUC o DNI"
              />

              <div className="debtors-client-results">
                {loadingClients ? (
                  <div className="debtors-client-empty">
                    Buscando clientes...
                  </div>
                ) : clientResults.length === 0 ? (
                  <div className="debtors-client-empty">
                    No se encontraron clientes
                  </div>
                ) : (
                  clientResults.map((client) => (
                    <button
                      type="button"
                      key={client.id}
                      className={
                        selectedClient?.id === client.id ||
                        selectedClient?.id === String(client.id)
                          ? 'debtors-client-item active'
                          : 'debtors-client-item'
                      }
                      onClick={() => handleSelectClient(client)}
                    >
                      <strong>
                        {client.nombres} {client.apellidos}
                      </strong>

                      <span>
                        RUC: {client.ruc || '-'} | DNI: {client.dni || '-'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Todos los meses"
              options={monthOptions}
            />

            <input
              className="debtors-year-input"
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              placeholder="Todos los años"
              min="2020"
            />

            <Button onClick={handleSearchDebts} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar deudas'}
            </Button>

            <Button variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </Button>
          </div>

          <div className="debtors-summary">
            <span>Total: {pagination.total}</span>
            <span>
              Página {pagination.page} de {pagination.totalPages || 1}
            </span>
          </div>
        </div>

        {selectedClient && (
          <div className="debtors-selected-client">
            <strong>
              Cliente seleccionado: {selectedClient.nombres} {selectedClient.apellidos}
            </strong>
            <span>RUC: {selectedClient.ruc || '-'}</span>
            <span>DNI: {selectedClient.dni || '-'}</span>
          </div>
        )}

        {error && (
          <div className="debtors-error">
            {error}
          </div>
        )}

        <div className="debtors-table-wrapper">
          <table className="debtors-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>RUC</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Mes</th>
                <th>Año</th>
                <th>Monto deuda</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    Cargando deudores...
                  </td>
                </tr>
              ) : debtors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    No se encontraron deudores
                  </td>
                </tr>
              ) : (
                debtors.map((debtor) => (
                  <tr key={debtor.id}>
                    <td>
                      <strong>
                        {debtor.nombres} {debtor.apellidos}
                      </strong>
                      <small>{debtor.correo || 'Sin correo'}</small>
                    </td>

                    <td>{debtor.ruc || '-'}</td>
                    <td>{debtor.dni || '-'}</td>
                    <td>{debtor.telefono || '-'}</td>
                    <td>{getMonthName(debtor.mes)}</td>
                    <td>{debtor.anio}</td>
                    <td>{formatMoney(debtor.monto_deuda)}</td>
                    <td>
                      <span className="debtors-status">
                        {debtor.estado}
                      </span>
                    </td>

                    <td>
                      <div className="debtors-actions">
                        <IconButton
                          title="Ver detalle"
                          variant="view"
                          onClick={() => handleOpenDetail(debtor.id)}
                        >
                          <FiEye />
                        </IconButton>

                        <IconButton
                          title="Marcar como pagado"
                          variant="edit"
                          onClick={() => handleOpenPayModal(debtor)}
                        >
                          <FiCheckCircle />
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
        title="Detalle de deuda"
        onClose={closeModals}
        size="md"
        footer={
          <Button variant="secondary" onClick={closeModals}>
            Cerrar
          </Button>
        }
      >
        {loadingDetail ? (
          <p>Cargando detalle...</p>
        ) : selectedDebtor ? (
          <div className="debtor-detail">
            <div>
              <span>Cliente</span>
              <strong>
                {selectedDebtor.nombres} {selectedDebtor.apellidos}
              </strong>
            </div>

            <div>
              <span>RUC</span>
              <strong>{selectedDebtor.ruc || '-'}</strong>
            </div>

            <div>
              <span>DNI</span>
              <strong>{selectedDebtor.dni || '-'}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{selectedDebtor.telefono || '-'}</strong>
            </div>

            <div>
              <span>Periodo</span>
              <strong>
                {getMonthName(selectedDebtor.mes)} {selectedDebtor.anio}
              </strong>
            </div>

            <div>
              <span>Monto deuda</span>
              <strong>{formatMoney(selectedDebtor.monto_deuda)}</strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>{selectedDebtor.estado}</strong>
            </div>

            <div>
              <span>Fecha registro</span>
              <strong>
                {selectedDebtor.fecha_registro
                  ? new Date(selectedDebtor.fecha_registro).toLocaleString()
                  : '-'}
              </strong>
            </div>

            <div className="debtor-detail-full">
              <span>Observaciones</span>
              <strong>{selectedDebtor.observaciones || '-'}</strong>
            </div>
          </div>
        ) : (
          <p>No hay datos para mostrar.</p>
        )}
      </Modal>

      <Modal
        open={payModalOpen}
        title="Confirmar pago de deuda"
        onClose={closeModals}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeModals}
              disabled={actionLoading}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleConfirmPay}
              disabled={actionLoading}
            >
              {actionLoading ? 'Procesando...' : 'Sí, marcar pagado'}
            </Button>
          </>
        }
      >
        {selectedDebtor && (
          <p className="debtor-pay-message">
            ¿Deseas marcar como pagada la deuda de{' '}
            <strong>
              {selectedDebtor.nombres} {selectedDebtor.apellidos}
            </strong>{' '}
            por el monto de{' '}
            <strong>{formatMoney(selectedDebtor.monto_deuda)}</strong>?
          </p>
        )}
      </Modal>
    </section>
  );
};

export default Debtors;
