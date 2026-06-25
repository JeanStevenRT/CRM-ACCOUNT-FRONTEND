import { FiUsers, FiUserPlus } from 'react-icons/fi';

const ControlTabs = ({ activeTab, onChange }) => (
  <div className="ctrl-tabs">
    <button
      type="button"
      className={`ctrl-tab ${activeTab === 'activos' ? 'active' : ''}`}
      onClick={() => onChange('activos')}
    >
      <FiUsers />
      Clientes activos
    </button>

    <button
      type="button"
      className={`ctrl-tab ${
        activeTab === 'referidos' ? 'active referidos' : ''
      }`}
      onClick={() => onChange('referidos')}
    >
      <FiUserPlus />
      Referidos
    </button>
  </div>
);

export default ControlTabs;
