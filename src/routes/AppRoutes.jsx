import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import Login from "../pages/Login/Login.jsx";

const Home = lazy(() => import('../pages/Home/Home.jsx'));
const Clients = lazy(() => import('../pages/Clients/Clients'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard.jsx'));
const RetiredClients = lazy(() => import('../pages/RetiredClients/RetiredClients'));
const Declarations = lazy(() => import('../pages/Declarations/Declarations'));
const SalesPurchases = lazy(() => import('../pages/SalesPurchases/SalesPurchases'));
const Debtors = lazy(() => import('../pages/Debtors/Debtors'));
const History = lazy(() => import('../pages/History/History'));
const Users = lazy(() => import('../pages/Users/Users.jsx'));
const Roles = lazy(() => import('../pages/Roles/Roles.jsx'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/retired" element={<RetiredClients />} />
            <Route path="/declarations" element={<Declarations />} />
            <Route path="/declarations/sales-purchases" element={<SalesPurchases />} />
            <Route path="/debtors" element={<Debtors />} />
            <Route path="/declarations/history" element={<History />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/roles" element={<Roles />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
