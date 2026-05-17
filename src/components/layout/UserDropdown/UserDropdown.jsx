import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './UserDropdown.css';

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-dropdown">
      <button
        className="user-dropdown-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="user-avatar">
          {user?.nombres?.charAt(0) || 'U'}
        </span>

        <span className="user-name">
          {user?.nombres || 'Usuario'}
        </span>
      </button>

      {open && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-info">
            <strong>{user?.nombres} {user?.apellidos}</strong>
            <small>{user?.role}</small>
          </div>

          <button onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;