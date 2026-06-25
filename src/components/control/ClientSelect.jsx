import { useEffect, useRef, useState } from 'react';

const ClientSelect = ({ label, value, onChange, clientes }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filteredClients = clientes
    .filter((client) => {
      const search = query.toLowerCase();

      return (
        (client.nombres || '').toLowerCase().includes(search) ||
        (client.apellidos || '').toLowerCase().includes(search) ||
        (client.ruc || '').includes(search)
      );
    })
    .slice(0, 30);

  const selectedClient = clientes.find(
    (client) => String(client.id) === String(value)
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="ctrl-client-select" ref={containerRef}>
      <label className="ctrl-form-label">{label}</label>

      <button
        type="button"
        className={`ctrl-client-selected ${open ? 'open' : ''}`}
        onClick={() => {
          setOpen((current) => !current);
          setQuery('');
        }}
      >
        {selectedClient ? (
          `${selectedClient.nombres} ${selectedClient.apellidos || ''} (${selectedClient.ruc})`
        ) : (
          <span className="ctrl-placeholder">Seleccionar cliente...</span>
        )}
        <span className="ctrl-select-arrow">v</span>
      </button>

      {open && (
        <div className="ctrl-client-dropdown">
          <input
            autoFocus
            className="ctrl-client-search"
            placeholder="Buscar nombre o RUC..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="ctrl-client-list">
            {filteredClients.length === 0 ? (
              <div className="ctrl-client-empty">Sin resultados</div>
            ) : (
              filteredClients.map((client) => (
                <button
                  type="button"
                  key={client.id}
                  className={`ctrl-client-option ${
                    String(client.id) === String(value) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    onChange(client);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className="ctrl-client-name">
                    {client.nombres} {client.apellidos || ''}
                  </span>
                  <span className="ctrl-client-ruc">{client.ruc}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelect;
