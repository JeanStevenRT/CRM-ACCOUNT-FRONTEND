import { useState } from 'react';
import Button from '../../common/Button/Button';
import './ClientForm.css';

// Configuración de tipos de documento
const TIPOS_DOC = [
  { value: 'DNI',               label: 'DNI',                maxLen: 8,  placeholder: '8 dígitos' },
  { value: 'CARNET_EXTRANJERIA', label: 'Carné de Extranjería', maxLen: 9,  placeholder: '9 dígitos' },
  { value: 'PASAPORTE',         label: 'Pasaporte',          maxLen: 20, placeholder: 'Alfanumérico' },
];

const initialState = {
  tipo_cliente_id: '',
  regimen_id: '',
  nombres: '',
  apellidos: '',
  ruc: '',
  tipo_documento: 'DNI',
  dni: '',
  correo: '',
  telefono: '',
  direccion: '',
};

// ─── Simple sponsor searchable select ────────────────────────────────────────
const SponsorSelect = ({ clientes, value, onChange }) => {
  const [q, setQ] = useState('');

  const filtered = clientes
    .filter(c => {
      const s = q.toLowerCase();
      return (
        (c.nombres || '').toLowerCase().includes(s) ||
        (c.apellidos || '').toLowerCase().includes(s) ||
        (c.ruc || '').includes(s)
      );
    })
    .slice(0, 50);

  return (
    <div className="cf-sponsor-wrap">
      <input
        className="cf-sponsor-search"
        placeholder="Buscar nombre o RUC..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <select
        className="cf-sponsor-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        size={Math.min(filtered.length + 1, 6)}
      >
        <option value="">— Seleccionar sponsor —</option>
        {filtered.map(c => (
          <option key={c.id} value={c.id}>
            {c.nombres} {c.apellidos || ''} · {c.ruc}
          </option>
        ))}
      </select>
    </div>
  );
};

const ClientForm = ({
  initialValues = initialState,
  onSubmit,
  submitText = 'Guardar',
  loading = false,
  // Referido feature
  showReferidoOption = false,
  clientes = [],
}) => {
  const [form, setForm] = useState({
    ...initialState,
    ...initialValues,
  });

  // Referido state (independent of client data)
  const [esReferido, setEsReferido] = useState('NO');
  const [sponsorId, setSponsorId]   = useState('');
  const [pagoRef, setPagoRef]       = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (showReferidoOption && esReferido === 'SI') {
      if (!sponsorId) {
        alert('Selecciona el cliente sponsor.');
        return;
      }
      if (!pagoRef || isNaN(Number(pagoRef)) || Number(pagoRef) <= 0) {
        alert('Ingresa el monto del pago del referido.');
        return;
      }
    }

    onSubmit({
      ...form,
      tipo_cliente_id: Number(form.tipo_cliente_id),
      regimen_id:      Number(form.regimen_id),
      tipo_documento:  form.tipo_documento || 'DNI',
      // Referido extras (prefixed with _ so they don't go to the clients API)
      _esReferido: showReferidoOption ? esReferido : 'NO',
      _sponsorId:  sponsorId ? Number(sponsorId) : null,
      _pagoRef:    pagoRef   ? parseFloat(pagoRef) : 0,
    });
  };

  const sponsorSeleccionado = clientes.find(c => String(c.id) === String(sponsorId));

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form-grid">
        <label>
          Tipo de cliente
          <select name="tipo_cliente_id" value={form.tipo_cliente_id} onChange={handleChange} required>
            <option value="">Seleccionar</option>
            <option value="1">Datadriver</option>
            <option value="2">Taxista</option>
            <option value="3">Negocio</option>
          </select>
        </label>

        <label>
          Régimen
          <select name="regimen_id" value={form.regimen_id} onChange={handleChange} required>
            <option value="">Seleccionar</option>
            <option value="1">Especial</option>
            <option value="2">General</option>
            <option value="3">Mype</option>
          </select>
        </label>

        <label>
          Nombres
          <input name="nombres" value={form.nombres} onChange={handleChange} required />
        </label>

        <label>
          Apellidos
          <input name="apellidos" value={form.apellidos || ''} onChange={handleChange} />
        </label>

        <label>
          RUC
          <input name="ruc" value={form.ruc || ''} onChange={handleChange} maxLength="11" />
        </label>

        {/* Tipo de documento + número */}
        <div className="cf-doc-group">
          <label className="cf-doc-type-label">
            Tipo documento
            <select
              name="tipo_documento"
              value={form.tipo_documento || 'DNI'}
              onChange={e => {
                setForm(prev => ({ ...prev, tipo_documento: e.target.value, dni: '' }));
              }}
            >
              {TIPOS_DOC.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="cf-doc-num-label">
            {TIPOS_DOC.find(t => t.value === (form.tipo_documento || 'DNI'))?.label || 'Documento'}
            <input
              name="dni"
              value={form.dni || ''}
              onChange={handleChange}
              maxLength={TIPOS_DOC.find(t => t.value === (form.tipo_documento || 'DNI'))?.maxLen || 20}
              placeholder={TIPOS_DOC.find(t => t.value === (form.tipo_documento || 'DNI'))?.placeholder}
            />
          </label>
        </div>

        <label>
          Correo
          <input type="email" name="correo" value={form.correo || ''} onChange={handleChange} />
        </label>

        <label>
          Teléfono
          <input name="telefono" value={form.telefono || ''} onChange={handleChange} />
        </label>

        <label className="client-form-full">
          Dirección
          <input name="direccion" value={form.direccion || ''} onChange={handleChange} />
        </label>
      </div>

      {/* ── Sección Referido ── */}
      {showReferidoOption && (
        <div className="cf-referido-section">
          <div className="cf-referido-header">
            <span className="cf-referido-label">🤝 ¿Este cliente viene referido?</span>
            <div className="cf-toggle-group">
              <button
                type="button"
                className={`cf-toggle-btn ${esReferido === 'NO' ? 'active-no' : ''}`}
                onClick={() => { setEsReferido('NO'); setSponsorId(''); setPagoRef(''); }}
              >
                NO
              </button>
              <button
                type="button"
                className={`cf-toggle-btn ${esReferido === 'SI' ? 'active-si' : ''}`}
                onClick={() => setEsReferido('SI')}
              >
                SI
              </button>
            </div>
          </div>

          {esReferido === 'SI' && (
            <div className="cf-referido-detail">
              <div className="cf-referido-detail-inner">
                <div className="cf-sponsor-col">
                  <label className="cf-detail-label">Sponsor (quien lo refirió)</label>
                  <SponsorSelect
                    clientes={clientes}
                    value={sponsorId}
                    onChange={setSponsorId}
                  />
                  {sponsorSeleccionado && (
                    <div className="cf-sponsor-badge">
                      ✅ {sponsorSeleccionado.nombres} {sponsorSeleccionado.apellidos || ''} — RUC: {sponsorSeleccionado.ruc}
                    </div>
                  )}
                </div>

                <div className="cf-pago-col">
                  <label className="cf-detail-label">Pago del referido (S/)</label>
                  <input
                    className="cf-pago-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={pagoRef}
                    onChange={e => setPagoRef(e.target.value)}
                  />
                  {pagoRef && !isNaN(Number(pagoRef)) && Number(pagoRef) > 0 && (
                    <div className="cf-desc-preview">
                      Descuento al sponsor: <strong>S/{(Number(pagoRef) * 0.5).toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="client-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
