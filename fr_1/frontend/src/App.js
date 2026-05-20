import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MaterialsPage from './pages/MaterialsPage';
import HRMSPage from './pages/HRMSPage';
import ERPPage from './pages/ERPPage';
import CRMPage from './pages/CRMPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="materials"
          element={
            <RoleBasedRoute allowedRoles={["Admin", "Manager", "Employee"]}>
              <MaterialsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="hrms"
          element={
            <RoleBasedRoute allowedRoles={["Admin", "HR"]}>
              <HRMSPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="erp"
          element={
            <RoleBasedRoute allowedRoles={["Admin", "Manager"]}>
              <ERPPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="crm"
          element={
            <RoleBasedRoute allowedRoles={["Admin", "Sales"]}>
              <CRMPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <RoleBasedRoute allowedRoles={["Admin", "Manager", "HR"]}>
              <ReportsPage />
            </RoleBasedRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;
