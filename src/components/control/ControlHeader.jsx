import { FiDownload, FiUpload, FiUserPlus, FiUsers } from 'react-icons/fi';

const ControlHeader = ({
  activeTab,
  months,
  years,
  month,
  year,
  search,
  loading,
  importing,
  hasClients,
  clientImportRef,
  referralImportRef,
  onMonthChange,
  onYearChange,
  onSearchChange,
  onNewClient,
  onNewReferral,
  onExport,
  onImportClients,
  onImportReferrals,
}) => (
  <div className="ctrl-header">
    <div className="ctrl-header-left">
      <h1>Control interno</h1>
      <div className="ctrl-period">
        <select value={month} onChange={(event) => onMonthChange(Number(event.target.value))}>
          {months.map((monthName, index) => (
            <option key={monthName} value={index + 1}>
              {monthName}
            </option>
          ))}
        </select>

        <select value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </div>

    {activeTab === 'activos' && (
      <input
        className="ctrl-search"
        placeholder="Buscar nombre o RUC..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    )}

    <div className="ctrl-header-actions">
      {activeTab === 'activos' ? (
        <>
          <button type="button" className="ctrl-action-btn new-client" onClick={onNewClient}>
            <FiUsers />
            Cliente
          </button>
          <button
            type="button"
            className="ctrl-action-btn export"
            onClick={onExport}
            disabled={loading || !hasClients}
          >
            <FiDownload />
            Exportar
          </button>
          <button
            type="button"
            className="ctrl-action-btn import"
            onClick={() => clientImportRef.current?.click()}
            disabled={importing}
          >
            <FiUpload />
            {importing ? 'Importando...' : 'Importar'}
          </button>
          <input
            ref={clientImportRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={onImportClients}
          />
        </>
      ) : (
        <>
          <button type="button" className="ctrl-action-btn new-ref" onClick={onNewReferral}>
            <FiUserPlus />
            Referido
          </button>
          <button
            type="button"
            className="ctrl-action-btn import-ref"
            onClick={() => referralImportRef.current?.click()}
            disabled={importing}
          >
            <FiUpload />
            {importing ? 'Importando...' : 'Importar referidos'}
          </button>
          <input
            ref={referralImportRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={onImportReferrals}
          />
        </>
      )}
    </div>
  </div>
);

export default ControlHeader;
