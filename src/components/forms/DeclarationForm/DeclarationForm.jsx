import { useEffect, useState } from 'react';
import Button from '../../common/Button/Button';
import SearchInput from '../../common/SearchInput/SearchInput';
import Select from '../../common/Select/Select';
import { getClientsRequest } from '../../../services/clients.service';
import { useDebounce } from '../../../hooks/useDebounce';
import './DeclarationForm.css';

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

const regimenOptions = [
  { value: '1', label: 'Especial' },
  { value: '2', label: 'General' },
  { value: '3', label: 'Mype' },
];

const getTasaIrByRegimenId = (regimenId) => {
  const id = Number(regimenId);

  if (id === 1 || id === 2) return 1.5;
  if (id === 3) return 1;

  return '';
};

const currentYear = new Date().getFullYear();

const initialState = {
  cliente_id: '',
  regimen_id: '',
  anio: currentYear,
  mes: '',
  sire: false,
  tasa_ir: 0,
  detraccion: 0,
  precio_final: 0,
  precio_pagado: 0,
  observaciones: '',
};

const DeclarationForm = ({
  onSubmit,
  loading = false,
  submitText = 'Guardar declaración',
}) => {
  const [form, setForm] = useState(initialState);

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  const debouncedClientSearch = useDebounce(clientSearch, 400);

  const fetchClients = async () => {
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
  };

  useEffect(() => {
    fetchClients();
  }, [debouncedClientSearch]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

    const handleSelectClient = (client) => {
        const regimenId = client.regimen_id || '';
        const tasaIr = getTasaIrByRegimenId(regimenId);

        setSelectedClient(client);
        setClientSearch(`${client.nombres} ${client.apellidos || ''}`);

        setForm((prev) => ({
            ...prev,
            cliente_id: client.id,
            regimen_id: regimenId,
            tasa_ir: tasaIr,
        }));
   };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      cliente_id: Number(form.cliente_id),
      regimen_id: Number(form.regimen_id),
      anio: Number(form.anio),
      mes: Number(form.mes),
      sire: Boolean(form.sire),
      tasa_ir: Number(form.tasa_ir || 0),
      detraccion: Number(form.detraccion || 0),
      precio_final: Number(form.precio_final || 0),
      precio_pagado: Number(form.precio_pagado || 0),
      observaciones: form.observaciones || null,
    });
  };

  return (
    <form className="declaration-form" onSubmit={handleSubmit}>
      <div className="declaration-form-section">
        <label className="declaration-client-search">
          Buscar cliente
          <SearchInput
            value={clientSearch}
            onChange={setClientSearch}
            placeholder="Buscar por nombre, RUC o DNI"
          />
        </label>

        <div className="declaration-client-results">
          {loadingClients ? (
            <div className="declaration-client-empty">
              Buscando clientes...
            </div>
          ) : clientResults.length === 0 ? (
            <div className="declaration-client-empty">
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
                    ? 'declaration-client-item active'
                    : 'declaration-client-item'
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

      <div className="declaration-form-grid">
        <label>
          Mes
          <Select
            value={form.mes}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                mes: value,
              }))
            }
            placeholder="Seleccionar mes"
            options={monthOptions}
          />
        </label>

        <label>
          Año
          <input
            type="number"
            name="anio"
            value={form.anio}
            onChange={handleChange}
            min="2020"
            required
          />
        </label>

        <label>
          Régimen
          <Select
            value={String(form.regimen_id || '')}
            onChange={(value) =>
                setForm((prev) => ({
                ...prev,
                regimen_id: value,
                tasa_ir: getTasaIrByRegimenId(value),
                }))
            }
            placeholder="Seleccionar régimen"
            options={regimenOptions}
            />
        </label>

        <label>
          Tasa IR %
             <input
                type="number"
                name="tasa_ir"
                value={form.tasa_ir}
                readOnly
                step="0.01"
                min="0"
            />
        </label>

        <label>
          Detracción
          <input
            type="number"
            name="detraccion"
            value={form.detraccion}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label>
          Precio final
          <input
            type="number"
            name="precio_final"
            value={form.precio_final}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label>
          Precio pagado
          <input
            type="number"
            name="precio_pagado"
            value={form.precio_pagado}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </label>

        <label className="declaration-checkbox">
          <input
            type="checkbox"
            name="sire"
            checked={form.sire}
            onChange={handleChange}
          />
          SIRE presentado
        </label>

        <label className="declaration-form-full">
          Observaciones
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="3"
          />
        </label>
      </div>

      <div className="declaration-form-actions">
        <Button
          type="submit"
          disabled={
            loading ||
            !form.cliente_id ||
            !form.regimen_id ||
            !form.mes ||
            !form.anio
          }
        >
          {loading ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default DeclarationForm;