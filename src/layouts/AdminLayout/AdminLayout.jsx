import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Topbar from '../../components/layout/Topbar/Topbar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 860px)').matches;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSidebarNavigate = () => {
    if (window.matchMedia('(max-width: 860px)').matches) {
      closeSidebar();
    }
  };

  return (
    <div className={sidebarOpen ? 'admin-layout sidebar-open' : 'admin-layout sidebar-closed'}>
      <Sidebar open={sidebarOpen} onNavigate={handleSidebarNavigate} />

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Cerrar menu lateral"
          onClick={closeSidebar}
        />
      )}

      <div className="admin-main">
        <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
