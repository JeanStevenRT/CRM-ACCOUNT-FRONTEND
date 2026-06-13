import { FiMenu } from 'react-icons/fi';
import UserDropdown from '../UserDropdown/UserDropdown';
import './Topbar.css';

const Topbar = ({ sidebarOpen = true, onToggleSidebar }) => {
  return (
    <header className="topbar">
      <div>
        <button
          type="button"
          className="topbar-menu-button"
          aria-label={sidebarOpen ? 'Cerrar menu lateral' : 'Abrir menu lateral'}
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <FiMenu />
        </button>
      </div>

      <UserDropdown />
    </header>
  );
};

export default Topbar;
