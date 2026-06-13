import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiShoppingCart, FiTrash2, FiEdit2 } from 'react-icons/fi';
import EditDeclarationForm from '../../components/forms/EditDeclarationForm/EditDeclarationForm';
import SearchInput from '../../components/common/SearchInput/SearchInput';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';
import Modal from '../../components/common/Modal/Modal';
import Pagination from '../../components/common/Pagination/Pagination';
import DeclarationForm from '../../components/forms/DeclarationForm/DeclarationForm';

import {
  getDeclarationsRequest,
  getDeclarationByIdRequest,
  createDeclarationRequest,
    updateDeclarationRequest,
  deleteDeclarationRequest,
  recalculateDeclarationRequest,
} from '../../services/declarations.service';

import { useDebounce } from '../../hooks/useDebounce';
import { formatMoney, getMonthName } from '../../utils/formatters';

import './Declarations.css';

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

const Declarations = () => {
  const navigate = useNavigate();

  const [declarations, setDeclarations] = useState([]);

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [declarationToDelete, setDeclarationToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
    const [declarationToEdit, setDeclarationToEdit] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const fetchDeclarations = useCallback(async ({
    page = 1,
    searchValue = debouncedSearch,
    monthValue = selectedMonth,
  } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await getDeclarationsRequest({
        search: searchValue,
        mes: monthValue,
        page,
        limit: pagination.limit,
      });

      setDeclarations(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar declaraciones');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedMonth, pagination.limit]);

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

  const handlePageChange = (nextPage) => {
    fetchDeclarations({
      page: nextPage,
      searchValue: debouncedSearch,
      monthValue: selectedMonth,
    });
  };

  const handleCreateDeclaration = async (formData) => {
    try {
      setActionLoading(true);

      await createDeclarationRequest(formData);

      setCreateModalOpen(false);

      await fetchDeclarations({
        page: 1,
        searchValue: debouncedSearch,
        monthValue: selectedMonth,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear declaración');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);

      const response = await getDeclarationByIdRequest(id);

      setSelectedDeclaration(response);
    } catch (error) {
      alert(error.response?.data?.message || 'Error al obtener declaración');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGoToSalesPurchases = (declaration) => {
    const params = new URLSearchParams({
      clientId: declaration.cliente_id,
      month: declaration.mes,
      year: declaration.anio,
      declarationId: declaration.id,
    });

    navigate(`/declarations/sales-purchases?${params.toString()}`);
  };

  const openDeleteModal = (declaration) => {
    setDeclarationToDelete(declaration);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeclarationToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);

      await deleteDeclarationRequest(declarationToDelete.id);

      closeDeleteModal();

      await fetchDeclarations({
        page: pagination.page,
        searchValue: debouncedSearch,
        monthValue: selectedMonth,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar declaración');
    } finally {
      setActionLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedDeclaration(null);
    setDetailModalOpen(false);
  };

  const openEditModal = async (id) => {
  try {
    setActionLoading(true);

    const response = await getDeclarationByIdRequest(id);

    setDeclarationToEdit(response);
    setEditModalOpen(true);
  } catch (error) {
    alert(error.response?.data?.message || 'Error al obtener declaración');
  } finally {
    setActionLoading(false);
  }
};

const closeEditModal = () => {
  setDeclarationToEdit(null);
  setEditModalOpen(false);
};

    const handleUpdateDeclaration = async (formData) => {
    try {
        setActionLoading(true);

        await updateDeclarationRequest(declarationToEdit.id, formData);

        await recalculateDeclarationRequest(declarationToEdit.id);

        closeEditModal();

        await fetchDeclarations({
        page: pagination.page,
        searchValue: debouncedSearch,
        monthValue: selectedMonth,
        });
    } catch (error) {
        alert(error.response?.data?.message || 'Error al actualizar declaración');
    } finally {
        setActionLoading(false);
    }
    };

  useEffect(() => {
    fetchDeclarations({
      page: 1,
      searchValue: debouncedSearch,
      monthValue: selectedMonth,
    });
  }, [debouncedSearch, selectedMonth, fetchDeclarations]);

  return (
    <section className="declarations-page">
      <div className="declarations-header">
        <div>
          <h1>Declaraciones mensuales</h1>
          <p>Consulta los registros mensuales de cada cliente.</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          Nueva declaración
        </Button>
      </div>

      <div className="declarations-card">
        <div className="declarations-toolbar">
          <div className="declarations-filters">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por cliente, RUC o DNI"
            />

            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Todos los meses"
              options={monthOptions}
            />
          </div>

          <div className="declarations-summary">
            <span>Total: {pagination.total}</span>
            <span>
              Página {pagination.page} de {pagination.totalPages || 1}
            </span>
          </div>
        </div>

        {error && (
          <div className="declarations-error">
            {error}
          </div>
        )}

        <div className="declarations-table-wrapper">
          <table className="declarations-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>RUC</th>
                <th>Mes</th>
                <th>Año</th>
                <th>Régimen</th>
                <th>Ventas</th>
                <th>Compras</th>
                <th>IGV</th>
                <th>IR</th>
                <th>Deuda</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="table-empty">
                    Cargando declaraciones...
                  </td>
                </tr>
              ) : declarations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="table-empty">
                    No se encontraron declaraciones
                  </td>
                </tr>
              ) : (
                declarations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.nombres} {item.apellidos}
                      </strong>
                    </td>

                    <td>{item.ruc || '-'}</td>
                    <td>{getMonthName(item.mes)}</td>
                    <td>{item.anio}</td>
                    <td>{item.regimen || '-'}</td>
                    <td>{formatMoney(item.total_ventas_importe)}</td>
                    <td>{formatMoney(item.total_compras_importe)}</td>
                    <td>{formatMoney(item.total_igv)}</td>
                    <td>{formatMoney(item.total_ir)}</td>
                    <td>{formatMoney(item.monto_por_pagar)}</td>

                    <td>
                      <div className="declarations-actions">
                        <IconButton
                          title="Ver declaración"
                          variant="view"
                          onClick={() => handleOpenDetail(item.id)}
                        >
                          <FiEye />
                        </IconButton>
                        <IconButton
                            title="Editar declaración"
                            variant="edit"
                            disabled={actionLoading}
                            onClick={() => openEditModal(item.id)}
                            >
                            <FiEdit2 />
                        </IconButton>

                        <IconButton
                          title="Ver compras y ventas"
                          variant="view"
                          onClick={() => handleGoToSalesPurchases(item)}
                        >
                          <FiShoppingCart />
                        </IconButton>
                        <IconButton
                          title="Eliminar declaración"
                          variant="danger"
                          disabled={actionLoading}
                          onClick={() => openDeleteModal(item)}
                        >
                          <FiTrash2 />
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
        title="Nueva declaración"
        onClose={() => setCreateModalOpen(false)}
        size="lg"
      >
        <DeclarationForm
          loading={actionLoading}
          submitText="Crear declaración"
          onSubmit={handleCreateDeclaration}
        />
      </Modal>

      <Modal
        open={detailModalOpen}
        title="Detalle de declaración"
        onClose={closeDetailModal}
        size="lg"
        footer={
          <>
            {selectedDeclaration && (
              <Button
                variant="secondary"
                onClick={() => handleGoToSalesPurchases(selectedDeclaration)}
              >
                Ver compras y ventas
              </Button>
            )}

            <Button variant="secondary" onClick={closeDetailModal}>
              Cerrar
            </Button>
          </>
        }
      >
        {loadingDetail ? (
          <p>Cargando detalle...</p>
        ) : selectedDeclaration ? (
          <div className="declaration-detail">
            <div>
              <span>Cliente</span>
              <strong>
                {selectedDeclaration.nombres} {selectedDeclaration.apellidos}
              </strong>
            </div>

            <div>
              <span>RUC</span>
              <strong>{selectedDeclaration.ruc || '-'}</strong>
            </div>

            <div>
              <span>Mes</span>
              <strong>{getMonthName(selectedDeclaration.mes)}</strong>
            </div>

            <div>
              <span>Año</span>
              <strong>{selectedDeclaration.anio}</strong>
            </div>

            <div>
              <span>Régimen</span>
              <strong>{selectedDeclaration.regimen || '-'}</strong>
            </div>

            <div>
              <span>SIRE</span>
              <strong>{selectedDeclaration.sire ? 'Sí' : 'No'}</strong>
            </div>

            <div>
              <span>Tasa IR aplicada</span>
              <strong>{selectedDeclaration.tasa_ir || 0}%</strong>
            </div>

            <div>
              <span>Detracción</span>
              <strong>{formatMoney(selectedDeclaration.detraccion)}</strong>
            </div>

            <div>
              <span>Total ventas base</span>
              <strong>{formatMoney(selectedDeclaration.total_ventas_base)}</strong>
            </div>

            <div>
              <span>Total ventas IGV</span>
              <strong>{formatMoney(selectedDeclaration.total_ventas_igv)}</strong>
            </div>

            <div>
              <span>Total ventas importe</span>
              <strong>{formatMoney(selectedDeclaration.total_ventas_importe)}</strong>
            </div>

            <div>
              <span>Total compras base</span>
              <strong>{formatMoney(selectedDeclaration.total_compras_base)}</strong>
            </div>

            <div>
              <span>Total compras IGV</span>
              <strong>{formatMoney(selectedDeclaration.total_compras_igv)}</strong>
            </div>

            <div>
              <span>Total compras importe</span>
              <strong>{formatMoney(selectedDeclaration.total_compras_importe)}</strong>
            </div>

            <div>
              <span>Total IGV</span>
              <strong>{formatMoney(selectedDeclaration.total_igv)}</strong>
            </div>

            <div>
              <span>Total IR</span>
              <strong>{formatMoney(selectedDeclaration.total_ir)}</strong>
            </div>

            <div>
              <span>Crédito fiscal</span>
              <strong>{formatMoney(selectedDeclaration.credito_fiscal)}</strong>
            </div>

            <div>
              <span>Precio final</span>
              <strong>{formatMoney(selectedDeclaration.precio_final)}</strong>
            </div>

            <div>
              <span>Precio pagado</span>
              <strong>{formatMoney(selectedDeclaration.precio_pagado)}</strong>
            </div>

            <div>
              <span>Monto por pagar</span>
              <strong>{formatMoney(selectedDeclaration.monto_por_pagar)}</strong>
            </div>

            <div className="declaration-detail-full">
              <span>Observaciones</span>
              <strong>{selectedDeclaration.observaciones || '-'}</strong>
            </div>
          </div>
        ) : (
          <p>No hay datos para mostrar.</p>
        )}
      </Modal>
        <Modal
            open={editModalOpen}
            title="Editar declaración"
            onClose={closeEditModal}
            size="lg"
            >
            {declarationToEdit && (
                <EditDeclarationForm
                initialValues={declarationToEdit}
                loading={actionLoading}
                submitText="Actualizar declaración"
                onSubmit={handleUpdateDeclaration}
                />
            )}
        </Modal>
      <Modal
        open={deleteModalOpen}
        title="Eliminar declaración"
        onClose={closeDeleteModal}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeDeleteModal}
              disabled={actionLoading}
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </>
        }
      >
        {declarationToDelete && (
          <p className="delete-declaration-message">
            ¿Seguro que deseas eliminar la declaración de{' '}
            <strong>
              {declarationToDelete.nombres} {declarationToDelete.apellidos}
            </strong>{' '}
            correspondiente a{' '}
            <strong>
              {getMonthName(declarationToDelete.mes)} {declarationToDelete.anio}
            </strong>
            ?
            <br />
            <br />
            Esta acción también eliminará sus ventas y compras asociadas.
          </p>
        )}
      </Modal>
    </section>
  );
};

export default Declarations;
