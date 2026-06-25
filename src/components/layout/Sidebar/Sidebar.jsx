import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  FiArchive,
  FiBarChart2,
  FiBriefcase,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiList,
  FiShoppingCart,
  FiUserCheck,
  FiUsers,
  FiSliders,
} from 'react-icons/fi';
import { ChevronDownIcon } from '../../common/Icons/Icons';
import { useAuth } from '../../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = ({ open = true, onNavigate }) => {
  const { user } = useAuth();
  const [clientsOpen, setClientsOpen] = useState(true);
  const [declarationsOpen, setDeclarationsOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const canManageUsers = user?.role === 'superadmin';

  return (
    <aside className={open ? 'sidebar open' : 'sidebar closed'}>
      <div className="sidebar-logo">Account CRM</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <FiGrid className="sidebar-item-icon" />
          <span>Dashboard</span>
        </NavLink>

        <button
          type="button"
          className={`sidebar-group-button ${clientsOpen ? 'open' : ''}`}
          onClick={() => setClientsOpen((prev) => !prev)}
        >
          <span className="sidebar-group-label">
            <FiUsers className="sidebar-item-icon" />
            Clientes
          </span>
          <ChevronDownIcon />
        </button>

        {clientsOpen && (
          <div className="sidebar-submenu">
            <NavLink
              to="/clients"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              <FiList className="sidebar-item-icon" />
              <span>Listar clientes</span>
            </NavLink>

            <NavLink
              to="/clients/retired"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              <FiUserCheck className="sidebar-item-icon" />
              <span>Clientes retirados</span>
            </NavLink>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-group-button ${declarationsOpen ? 'open' : ''}`}
          onClick={() => setDeclarationsOpen((prev) => !prev)}
        >
          <span className="sidebar-group-label">
            <FiFileText className="sidebar-item-icon" />
            Declaraciones
          </span>
          <ChevronDownIcon />
        </button>

        {declarationsOpen && (
          <div className="sidebar-submenu">
            <NavLink
              to="/declarations"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              <FiArchive className="sidebar-item-icon" />
              <span>Listar declaraciones</span>
            </NavLink>

            <NavLink
              to="/declarations/sales-purchases"
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
              }
            >
              <FiShoppingCart className="sidebar-item-icon" />
              <span>Compras y ventas</span>
            </NavLink>
            <NavLink
            to="/declarations/history"
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
            }
          >
            <FiClock className="sidebar-item-icon" />
            <span>Historial</span>
          </NavLink>
          </div>
        )}

        <NavLink
          to="/debtors"
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <FiCreditCard className="sidebar-item-icon" />
          <span>Deudores</span>
        </NavLink>

        <NavLink
          to="/control"
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <FiSliders className="sidebar-item-icon" />
          <span>Control interno</span>
        </NavLink>

        {canManageUsers && (
          <>
            <button
              type="button"
              className={`sidebar-group-button ${usersOpen ? 'open' : ''}`}
              onClick={() => setUsersOpen((prev) => !prev)}
            >
              <span className="sidebar-group-label">
                <FiBriefcase className="sidebar-item-icon" />
                Usuarios
              </span>
              <ChevronDownIcon />
            </button>

            {usersOpen && (
              <div className="sidebar-submenu">
                <NavLink
                  to="/users"
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
                  }
                >
                  <FiUsers className="sidebar-item-icon" />
                  <span>Gestionar usuarios</span>
                </NavLink>

                <NavLink
                  to="/users/roles"
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
                  }
                >
                  <FiBarChart2 className="sidebar-item-icon" />
                  <span>Gestionar roles</span>
                </NavLink>
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
