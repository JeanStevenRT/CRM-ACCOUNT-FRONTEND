import { FiMenu } from 'react-icons/fi';
import UserDropdown from '../UserDropdown/UserDropdown';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div>
        <button
          type="button"
          className="topbar-menu-button"
          aria-label="Abrir menú"
        >
          <FiMenu />
        </button>
      </div>

      <UserDropdown />
    </header>
  );
};

export default Topbar;
