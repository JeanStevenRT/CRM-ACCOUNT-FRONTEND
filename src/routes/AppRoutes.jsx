import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import Clients from '../pages/Clients/Clients';
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import RetiredClients from '../pages/RetiredClients/RetiredClients';
import Declarations from '../pages/Declarations/Declarations';
import SalesPurchases from '../pages/SalesPurchases/SalesPurchases';
import Debtors from '../pages/Debtors/Debtors';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/retired" element={<RetiredClients />} />
          <Route path="/declarations" element={<Declarations />} />
          <Route path="/declarations/sales-purchases" element={<SalesPurchases />} />
          <Route path="/debtors" element={<Debtors />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;