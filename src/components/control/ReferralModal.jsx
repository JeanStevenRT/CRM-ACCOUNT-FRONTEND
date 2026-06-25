import { FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import ClientSelect from './ClientSelect';

const ReferralModal = ({
  open,
  monthName,
  year,
  form,
  clients,
  loading,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="ctrl-modal-overlay" onClick={onClose}>
      <div className="ctrl-modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="ctrl-modal-header">
          <h2>Nuevo referido - {monthName} {year}</h2>
          <button
            type="button"
            className="ctrl-modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="ctrl-modal-body">
          <div className="ctrl-ref-form-grid">
            <div className="ctrl-ref-panel green">
              <div className="ctrl-ref-panel-title">REFERIDO</div>
              <ClientSelect
                label="Cliente referido"
                value={form.referido?.id}
                onChange={(client) => onChange({ referido: client })}
                clientes={clients}
              />
              <div className="ctrl-form-group">
                <label className="ctrl-form-label">Pago del referido (S/)</label>
                <input
                  className="ctrl-form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.referido_pago}
                  onChange={(event) => {
                    const payment = event.target.value;
                    const automaticDiscount = String(Number(payment || 0) * 0.5);

                    onChange({
                      referido_pago: payment,
                      descuento: form._descManual
                        ? form.descuento
                        : automaticDiscount,
                    });
                  }}
                />
              </div>
            </div>

            <div className="ctrl-ref-arrow-divider">
              <FiArrowRight />
            </div>

            <div className="ctrl-ref-panel yellow">
              <div className="ctrl-ref-panel-title">SPONSOR</div>
              <ClientSelect
                label="Cliente sponsor"
                value={form.sponsor?.id}
                onChange={(client) => onChange({ sponsor: client })}
                clientes={clients}
              />
              <div className="ctrl-form-group">
                <label className="ctrl-form-label">Descuento al sponsor (S/)</label>
                <input
                  className="ctrl-form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50% del pago"
                  value={form.descuento}
                  onChange={(event) =>
                    onChange({
                      descuento: event.target.value,
                      _descManual: true,
                    })
                  }
                />
                <span className="ctrl-form-hint">
                  Por defecto se calcula el 50% del pago
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ctrl-modal-footer">
          <button type="button" className="ctrl-action-btn ctrl-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="ctrl-action-btn new-ref"
            onClick={onSubmit}
            disabled={loading}
          >
            <FiCheck />
            {loading ? 'Guardando...' : 'Guardar referido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
