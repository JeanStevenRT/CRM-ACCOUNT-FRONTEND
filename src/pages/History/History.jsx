import { useCallback, useEffect, useRef, useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';

import SearchInput from '../../components/common/SearchInput/SearchInput';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import HistorySheet from '../../components/history/HistorySheet/HistorySheet';

import { getClientsRequest } from '../../services/clients.service';
import {
  getAllHistoryByClientRequest,
} from '../../services/history.service';

import { useDebounce } from '../../hooks/useDebounce';
import { getMonthName } from '../../utils/formatters';

import './History.css';

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

const currentYear = new Date().getFullYear();

const History = () => {
  const monthRefs = useRef({});

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [historyList, setHistoryList] = useState([]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  const debouncedClientSearch = useDebounce(clientSearch, 400);

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

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(`${client.nombres} ${client.apellidos || ''}`);
    setHistoryList([]);
    setMessage('');
    monthRefs.current = {};
  };

  const scrollToSelectedMonth = (month) => {
    const target = monthRefs.current[String(month)];

    if (!target) return;

    setTimeout(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 150);
  };

  const loadHistory = async () => {
    if (!selectedClient || !selectedYear) {
      alert('Selecciona cliente y año');
      return;
    }

    try {
      setLoadingHistory(true);
      setMessage('');

      const response = await getAllHistoryByClientRequest({
        clientId: selectedClient.id,
        anio: selectedYear,
      });

      setHistoryList(response);

      if (response.length === 0) {
        setMessage('No hay historial para este cliente en el año seleccionado.');
        return;
      }

      if (selectedMonth) {
        scrollToSelectedMonth(selectedMonth);
      }
    } catch (error) {
      setHistoryList([]);
      setMessage(error.response?.data?.message || 'No se pudo cargar el historial');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);

    if (value && historyList.length > 0) {
      scrollToSelectedMonth(value);
    }
  };

  const exportMonth = async (historyItem) => {
    try {
      setExporting(true);

      const clientName = `${historyItem.cliente.nombres}-${historyItem.cliente.apellidos || ''}`
        .trim()
        .replaceAll(' ', '-');

      const fileName = `historial-${clientName}-${getMonthName(historyItem.declaracion.mes)}-${historyItem.declaracion.anio}.pdf`;
      const { exportElementToPdf } = await import('../../utils/exportHistoryPdf');

      await exportElementToPdf({
        elementId: `history-sheet-${historyItem.declaracion.id}`,
        fileName,
      });
    } catch (error) {
      alert(error.message || 'Error al exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportAll = async () => {
    if (historyList.length === 0) {
      alert('Primero carga el historial');
      return;
    }

    try {
      setExporting(true);

      const clientName = `${selectedClient.nombres}-${selectedClient.apellidos || ''}`
        .trim()
        .replaceAll(' ', '-');
      const { exportElementToPdf } = await import('../../utils/exportHistoryPdf');

      await exportElementToPdf({
        elementId: 'history-all-sheets',
        fileName: `historial-completo-${clientName}-${selectedYear}.pdf`,
      });
    } catch (error) {
      alert(error.message || 'Error al exportar todo el historial');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="history-page">
      <div className="history-header">
        <div>
          <h1>Historial</h1>
          <p>Consulta y compara compras y ventas mensuales por cliente.</p>
        </div>
      </div>

      <div className="history-card">
        <div className="history-filters">
          <div className="history-client-search">
            <label>Buscar cliente</label>

            <SearchInput
              value={clientSearch}
              onChange={setClientSearch}
              placeholder="Buscar por nombre, RUC o DNI"
            />

            <div className="history-client-results">
              {loadingClients ? (
                <div className="history-client-empty">Buscando clientes...</div>
              ) : clientResults.length === 0 ? (
                <div className="history-client-empty">No se encontraron clientes</div>
              ) : (
                clientResults.map((client) => (
                  <button
                    type="button"
                    key={client.id}
                    className={
                      selectedClient?.id === client.id ||
                      selectedClient?.id === String(client.id)
                        ? 'history-client-item active'
                        : 'history-client-item'
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

          <div className="history-period-field">
            <label>Mes a ubicar</label>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              placeholder="Todos los meses"
              options={monthOptions}
            />
          </div>

          <div className="history-period-field">
            <label>Año</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              min="2020"
            />
          </div>

          <div className="history-actions-top">
            <Button onClick={loadHistory} disabled={loadingHistory}>
              <FiFileText />
              {loadingHistory ? 'Cargando...' : 'Mostrar historial'}
            </Button>
          </div>
        </div>

        {selectedClient && (
          <div className="history-selected-client">
            <strong>
              Cliente: {selectedClient.nombres} {selectedClient.apellidos}
            </strong>
            <span>RUC: {selectedClient.ruc || '-'}</span>
            <span>Año: {selectedYear}</span>
          </div>
        )}

        {message && (
          <div className="history-message">
            {message}
          </div>
        )}
      </div>

      {historyList.length > 0 && (
        <>
          <div className="history-export-actions">
            <Button onClick={exportAll} disabled={exporting}>
              <FiDownload />
              {exporting ? 'Exportando...' : 'Descargar todo'}
            </Button>
          </div>

          <div className="history-horizontal-wrapper">
            <div className="history-horizontal-scroll" id="history-all-sheets">
              {historyList.map((historyItem) => (
                <div
                  key={historyItem.declaracion.id}
                  className="history-month-card"
                  ref={(element) => {
                    if (element) {
                      monthRefs.current[String(historyItem.declaracion.mes)] = element;
                    }
                  }}
                >
                  <div className="history-month-card-actions">
                    <span>
                      {getMonthName(historyItem.declaracion.mes)} {historyItem.declaracion.anio}
                    </span>

                    <button
                      type="button"
                      onClick={() => exportMonth(historyItem)}
                      disabled={exporting}
                    >
                      <FiDownload />
                      PDF
                    </button>
                  </div>

                  <div id={`history-sheet-${historyItem.declaracion.id}`}>
                    <HistorySheet data={historyItem} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default History;
