import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiTrash2, FiRefreshCw, FiSave } from 'react-icons/fi';

import SearchInput from '../../components/common/SearchInput/SearchInput';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import IconButton from '../../components/common/IconButton/IconButton';

import { getClientsRequest, getClientByIdRequest } from '../../services/clients.service';
import {
  getDeclarationByIdRequest,
  getDeclarationsByClientRequest,
  recalculateDeclarationRequest,
} from '../../services/declarations.service';

import {
  getSalesByDeclarationRequest,
  createSaleRequest,
  updateSaleRequest,
  deleteSaleRequest,
} from '../../services/sales.service';

import {
  getPurchasesByDeclarationRequest,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
} from '../../services/purchases.service';

import { useDebounce } from '../../hooks/useDebounce';
import { formatMoney, getMonthName } from '../../utils/formatters';

import './SalesPurchases.css';

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

const rateOptions = [
  { value: '18', label: '18%' },
  { value: '10.5', label: '10.5%' },
  { value: '0', label: '0%' },
];

const currentYear = new Date().getFullYear();

const createEmptyRow = () => ({
  id: null,
  fecha: '',
  serie: '',
  numero: '',
  tasa: '18',
  base: '',
  isNew: true,
});

const roundTwo = (value) => {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
};

const calculateRow = (row) => {
  const base = Number(row.base || 0);
  const tasa = Number(row.tasa || 0);
  const igv = roundTwo(base * (tasa / 100));
  const total = roundTwo(base + igv);

  return {
    igv,
    total,
  };
};

const SalesPurchases = () => {
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedDeclaration, setSelectedDeclaration] = useState(null);

  const [salesRows, setSalesRows] = useState([createEmptyRow()]);
  const [purchaseRows, setPurchaseRows] = useState([createEmptyRow()]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingDeclaration, setLoadingDeclaration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [searchParams] = useSearchParams();

  const debouncedClientSearch = useDebounce(clientSearch, 400);

  const salesTotals = useMemo(() => {
    return salesRows.reduce(
      (acc, row) => {
        const { igv, total } = calculateRow(row);
        acc.base += Number(row.base || 0);
        acc.igv += igv;
        acc.total += total;
        return acc;
      },
      { base: 0, igv: 0, total: 0 }
    );
  }, [salesRows]);

  const purchaseTotals = useMemo(() => {
    return purchaseRows.reduce(
      (acc, row) => {
        const { igv, total } = calculateRow(row);
        acc.base += Number(row.base || 0);
        acc.igv += igv;
        acc.total += total;
        return acc;
      },
      { base: 0, igv: 0, total: 0 }
    );
  }, [purchaseRows]);

    const loadRowsByDeclaration = useCallback(async (declaration) => {
    setSelectedDeclaration(declaration);

    const [salesResponse, purchasesResponse] = await Promise.all([
        getSalesByDeclarationRequest(declaration.id),
        getPurchasesByDeclarationRequest(declaration.id),
    ]);

    const salesData = salesResponse.data || [];
    const purchasesData = purchasesResponse.data || [];

    setSalesRows(
        salesData.length > 0
        ? salesData.map((item) => ({
            id: item.id,
            fecha: item.fecha ? item.fecha.slice(0, 10) : '',
            serie: item.serie || '',
            numero: item.numero || '',
            tasa: String(Number(item.tasa)),
            base: String(item.base || ''),
            isNew: false,
            }))
        : [createEmptyRow()]
    );

    setPurchaseRows(
        purchasesData.length > 0
        ? purchasesData.map((item) => ({
            id: item.id,
            fecha: item.fecha ? item.fecha.slice(0, 10) : '',
            serie: item.serie || '',
            numero: item.numero || '',
            tasa: String(Number(item.tasa)),
            base: String(item.base || ''),
            isNew: false,
            }))
        : [createEmptyRow()]
    );
    }, []);

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

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        const clientId = searchParams.get('clientId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const declarationId = searchParams.get('declarationId');

        if (!clientId || !month || !year || !declarationId) return;

        const loadFromQueryParams = async () => {
            try {
            setLoadingDeclaration(true);
            setMessage('');

            const [client, declaration] = await Promise.all([
                getClientByIdRequest(clientId),
                getDeclarationByIdRequest(declarationId),
            ]);

            setSelectedClient(client);
            setClientSearch(`${client.nombres} ${client.apellidos || ''}`);
            setSelectedMonth(String(month));
            setSelectedYear(String(year));

            await loadRowsByDeclaration(declaration);

            setMessage('Declaración cargada automáticamente.');
            } catch (error) {
            alert(error.response?.data?.message || 'Error al cargar la declaración');
            } finally {
            setLoadingDeclaration(false);
            }
        };

    loadFromQueryParams(); }, [loadRowsByDeclaration, searchParams]);

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setClientSearch(`${client.nombres} ${client.apellidos || ''}`);
        setSelectedDeclaration(null);
        setSalesRows([createEmptyRow()]);
        setPurchaseRows([createEmptyRow()]);
        setMessage('');
    };

    const loadDeclarationData = async () => {
    if (!selectedClient || !selectedMonth || !selectedYear) {
        alert('Selecciona cliente, mes y año');
        return;
    }

    try {
        setLoadingDeclaration(true);
        setMessage('');

        const declarations = await getDeclarationsByClientRequest(selectedClient.id);

        const declaration = declarations.find((item) => {
        return (
            Number(item.mes) === Number(selectedMonth) &&
            Number(item.anio) === Number(selectedYear)
        );
        });

        if (!declaration) {
        setSelectedDeclaration(null);
        setSalesRows([createEmptyRow()]);
        setPurchaseRows([createEmptyRow()]);
        setMessage('No existe declaración para ese cliente, mes y año. Primero crea la declaración mensual.');
        return;
        }

        await loadRowsByDeclaration(declaration);
    } catch (error) {
        alert(error.response?.data?.message || 'Error al cargar compras y ventas');
    } finally {
        setLoadingDeclaration(false);
    }
    };

  const updateRow = (type, index, field, value) => {
    const setter = type === 'sales' ? setSalesRows : setPurchaseRows;

    setter((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const addRow = (type) => {
    const setter = type === 'sales' ? setSalesRows : setPurchaseRows;
    setter((prev) => [...prev, createEmptyRow()]);
  };

  const removeLocalRow = (type, index) => {
    const setter = type === 'sales' ? setSalesRows : setPurchaseRows;

    setter((prev) => {
      if (prev.length === 1) return [createEmptyRow()];
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const deleteSavedRow = async (type, row) => {
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar esta fila?');
    if (!confirmDelete) return;

    try {
      if (type === 'sales') {
        await deleteSaleRequest(row.id);
      } else {
        await deletePurchaseRequest(row.id);
      }

      await loadDeclarationData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar fila');
    }
  };

  const handleRemoveRow = async (type, index, row) => {
    if (row.id) {
      await deleteSavedRow(type, row);
      return;
    }

    removeLocalRow(type, index);
  };

  const normalizeRows = (rows) => {
    return rows.filter((row) => {
      return row.base !== '' || row.fecha || row.serie || row.numero;
    });
  };

  const saveRows = async () => {
    if (!selectedDeclaration) {
      alert('Primero carga una declaración existente');
      return;
    }

    try {
      setSaving(true);

      const validSalesRows = normalizeRows(salesRows);
      const validPurchaseRows = normalizeRows(purchaseRows);

      for (const row of validSalesRows) {
        const payload = {
          fecha: row.fecha || null,
          serie: row.serie || null,
          numero: row.numero || null,
          tasa: Number(row.tasa),
          base: Number(row.base || 0),
        };

        if (row.id) {
          await updateSaleRequest(row.id, payload);
        } else {
          await createSaleRequest(selectedDeclaration.id, payload);
        }
      }

      for (const row of validPurchaseRows) {
        const payload = {
          fecha: row.fecha || null,
          serie: row.serie || null,
          numero: row.numero || null,
          tasa: Number(row.tasa),
          base: Number(row.base || 0),
        };

        if (row.id) {
          await updatePurchaseRequest(row.id, payload);
        } else {
          await createPurchaseRequest(selectedDeclaration.id, payload);
        }
      }

      await recalculateDeclarationRequest(selectedDeclaration.id);
      await loadDeclarationData();

      setMessage('Compras y ventas guardadas correctamente.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar compras y ventas');
    } finally {
      setSaving(false);
    }
  };

  const recalculate = async () => {
    if (!selectedDeclaration) {
      alert('Primero carga una declaración existente');
      return;
    }

    try {
      setSaving(true);
      await recalculateDeclarationRequest(selectedDeclaration.id);
      await loadDeclarationData();
      setMessage('Declaración recalculada correctamente.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al recalcular');
    } finally {
      setSaving(false);
    }
  };

  const renderRows = (type, rows) => {
    return rows.map((row, index) => {
      const { igv, total } = calculateRow(row);

      return (
        <tr key={`${type}-${index}-${row.id || 'new'}`}>
          <td>
            <input
              type="date"
              value={row.fecha}
              onChange={(event) =>
                updateRow(type, index, 'fecha', event.target.value)
              }
            />
          </td>

          <td>
            <input
              value={row.serie}
              onChange={(event) =>
                updateRow(type, index, 'serie', event.target.value)
              }
              placeholder="F001"
            />
          </td>

          <td>
            <input
              value={row.numero}
              onChange={(event) =>
                updateRow(type, index, 'numero', event.target.value)
              }
              placeholder="000001"
            />
          </td>

          <td>
            <select
              value={row.tasa}
              onChange={(event) =>
                updateRow(type, index, 'tasa', event.target.value)
              }
            >
              {rateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </td>

          <td>
            <input
              type="number"
              step="0.01"
              min="0"
              value={row.base}
              onChange={(event) =>
                updateRow(type, index, 'base', event.target.value)
              }
              placeholder="0.00"
            />
          </td>

          <td>{formatMoney(igv)}</td>
          <td>{formatMoney(total)}</td>

          <td>
            <IconButton
              title="Eliminar fila"
              variant="danger"
              onClick={() => handleRemoveRow(type, index, row)}
            >
              <FiTrash2 />
            </IconButton>
          </td>
        </tr>
      );
    });
  };

  return (
    <section className="sales-purchases-page">
      <div className="sales-purchases-header">
        <div>
          <h1>Compras y ventas</h1>
          <p>Registra ventas y compras mensuales por cliente.</p>
        </div>
      </div>

      <div className="sales-purchases-card">
        <div className="sales-purchases-filters">
          <div className="client-search-box">
            <label>Buscar cliente</label>

            <SearchInput
              value={clientSearch}
              onChange={setClientSearch}
              placeholder="Buscar por nombre, RUC o DNI"
            />

            <div className="client-results">
              {loadingClients ? (
                <div className="client-result-empty">Buscando clientes...</div>
              ) : clientResults.length === 0 ? (
                <div className="client-result-empty">No se encontraron clientes</div>
              ) : (
                clientResults.map((client) => (
                  <button
                    type="button"
                    key={client.id}
                    className={
                      selectedClient?.id === client.id ||
                      selectedClient?.id === String(client.id)
                        ? 'client-result-item active'
                        : 'client-result-item'
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

          <div className="period-box">
            <label>Mes</label>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              placeholder="Seleccionar mes"
              options={monthOptions}
            />
          </div>

          <div className="period-box">
            <label>Año</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              min="2020"
            />
          </div>

          <div className="load-box">
            <Button onClick={loadDeclarationData} disabled={loadingDeclaration}>
              {loadingDeclaration ? 'Cargando...' : 'Cargar declaración'}
            </Button>
          </div>
        </div>

        {selectedClient && (
          <div className="selected-info">
            <strong>
              Cliente: {selectedClient.nombres} {selectedClient.apellidos}
            </strong>

            <span>
              Periodo: {selectedMonth ? getMonthName(selectedMonth) : '-'} {selectedYear}
            </span>

            <span>
              Declaración: {selectedDeclaration ? `#${selectedDeclaration.id}` : 'No cargada'}
            </span>
          </div>
        )}

        {message && (
          <div className="sales-purchases-message">
            {message}
          </div>
        )}
      </div>

      <div className="sales-purchases-section">
        <div className="table-section-header">
          <h2>Ventas</h2>

          <Button variant="secondary" onClick={() => addRow('sales')}>
            + Agregar fila
          </Button>
        </div>

        <div className="editable-table-wrapper">
          <table className="editable-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Serie</th>
                <th>Número</th>
                <th>Tasa</th>
                <th>Base</th>
                <th>IGV</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {renderRows('sales', salesRows)}

              <tr className="totals-row">
                <td colSpan="4">Totales</td>
                <td>{formatMoney(salesTotals.base)}</td>
                <td>{formatMoney(salesTotals.igv)}</td>
                <td>{formatMoney(salesTotals.total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="sales-purchases-section">
        <div className="table-section-header">
          <h2>Compras</h2>

          <Button variant="secondary" onClick={() => addRow('purchases')}>
            + Agregar fila
          </Button>
        </div>

        <div className="editable-table-wrapper">
          <table className="editable-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Serie</th>
                <th>Número</th>
                <th>Tasa</th>
                <th>Base</th>
                <th>IGV</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {renderRows('purchases', purchaseRows)}

              <tr className="totals-row">
                <td colSpan="4">Totales</td>
                <td>{formatMoney(purchaseTotals.base)}</td>
                <td>{formatMoney(purchaseTotals.igv)}</td>
                <td>{formatMoney(purchaseTotals.total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="sales-purchases-actions">
        <Button
          variant="secondary"
          onClick={recalculate}
          disabled={saving || !selectedDeclaration}
        >
          <FiRefreshCw /> Recalcular
        </Button>

        <Button
          onClick={saveRows}
          disabled={saving || !selectedDeclaration}
        >
          <FiSave /> {saving ? 'Guardando...' : 'Guardar compras y ventas'}
        </Button>
      </div>
    </section>
  );
};

export default SalesPurchases;
