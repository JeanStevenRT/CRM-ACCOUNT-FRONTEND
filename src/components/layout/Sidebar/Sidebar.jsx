import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDownIcon } from '../../common/Icons/Icons';
import './Sidebar.css';

const Sidebar = () => {
  const [clientsOpen, setClientsOpen] = useState(true);
  const [declarationsOpen, setDeclarationsOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Account CRM</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          Dashboard
        </NavLink>

        <button
          type="button"
          className={`sidebar-group-button ${clientsOpen ? 'open' : ''}`}
          onClick={() => setClientsOpen((prev) => !prev)}
        >
          <span>Clientes</span>
          <ChevronDownIcon />
        </button>

        {clientsOpen && (
          <div className="sidebar-submenu">
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              Listar clientes
            </NavLink>

            <NavLink
              to="/clients/retired"
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              Clientes retirados
            </NavLink>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-group-button ${declarationsOpen ? 'open' : ''}`}
          onClick={() => setDeclarationsOpen((prev) => !prev)}
        >
          <span>Declaraciones</span>
          <ChevronDownIcon />
        </button>

        {declarationsOpen && (
          <div className="sidebar-submenu">
            <NavLink
              to="/declarations"
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              Listar declaraciones
            </NavLink>

            <NavLink
              to="/declarations/sales-purchases"
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              Compras y ventas
            </NavLink>
          </div>
        )}

        <NavLink
          to="/debtors"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          Deudores
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;