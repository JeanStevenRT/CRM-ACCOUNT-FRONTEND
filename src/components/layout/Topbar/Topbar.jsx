import UserDropdown from '../UserDropdown/UserDropdown';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <div>
        <button className="topbar-menu-button">
          ☰
        </button>
      </div>

      <UserDropdown />
    </header>
  );
};

export default Topbar;