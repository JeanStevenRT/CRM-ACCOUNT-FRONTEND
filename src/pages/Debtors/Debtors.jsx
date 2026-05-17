import { useEffect, useState } from 'react';
import { FiEye, FiCheckCircle } from 'react-icons/fi';

import SearchInput from '../../components/common/SearchInput/SearchInput';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import Pagination from '../../components/common/Pagination/Pagination';

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

const currentDate = new Date();

const Debtors = () => {
  const [debtors, setDebtors] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

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

  const debouncedSearch = useDebounce(search, 400);

  const fetchDebtors = async ({
    page = 1,
    searchValue = debouncedSearch,
    monthValue = selectedMonth,
    yearValue = selectedYear,
  } = {}) => {
    if (!monthValue || !yearValue) return;

    try {
      setLoading(true);
      setError('');

      const response = await getDebtorsRequest({
        anio: yearValue,
        mes: monthValue,
        search: searchValue,
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
  };

  const handleSearchChange = (value) => {
    setSearch(value);
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

  const handlePageChange = (nextPage) => {
    fetchDebtors({
      page: nextPage,
      searchValue: debouncedSearch,
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
        searchValue: debouncedSearch,
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
    fetchDebtors({
      page: 1,
      searchValue: debouncedSearch,
      monthValue: selectedMonth,
      yearValue: selectedYear,
    });
  }, [debouncedSearch, selectedMonth, selectedYear]);

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
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por cliente, RUC o DNI"
            />

            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Seleccionar mes"
              options={monthOptions}
            />

            <input
              className="debtors-year-input"
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              min="2020"
            />
          </div>

          <span className="debtors-total">
            Total: {pagination.total}
          </span>
        </div>

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
                    No se encontraron deudores para este periodo
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