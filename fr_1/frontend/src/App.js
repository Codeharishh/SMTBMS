// src/App.js
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
import LeaveManagementPage from './pages/LeaveManagementPage';
import MaterialMovementsPage from './pages/MaterialMovementsPage';
import VendorsPage from './pages/VendorsPage';
import PayrollPage from './pages/PayrollPage';
import UserManagementPage from './pages/UserManagementPage';
import RolesPermissionsPage from './pages/RolesPermissionsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import BackupRestorePage from './pages/BackupRestorePage';
import HelpSupportPage from './pages/HelpSupportPage';
import CustomerPage from './pages/CustomerPage';
import FollowUps from './pages/FollowUps';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 🟢 Imported successfully

import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

import MainLayout from './layouts/MainLayout';

function App() {
  return (
    // 🟢 WRAPPED WHOLE APP MATRIX: Re-route your generated Google Client ID key here
    <GoogleOAuthProvider clientId="291403377955-5rht5sc1eki5irt44e7cihf85jm1kj04.apps.googleusercontent.com">
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Materials */}
          <Route
            path="materials"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <MaterialsPage />
              </RoleBasedRoute>
            }
          />

          {/* HRMS */}
          <Route
            path="hrms"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR']}>
                <HRMSPage />
              </RoleBasedRoute>
            }
          />

          {/* ERP */}
          <Route
            path="erp"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <ERPPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="material-movements"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "Manager"]}>
                <MaterialMovementsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="vendors"
            element={
              <RoleBasedRoute allowedRoles={["Admin", "Manager"]}>
                <VendorsPage />
              </RoleBasedRoute>
            }
          />

          {/* CRM */}
          <Route
            path="crm"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Sales']}>
                <CRMPage />
              </RoleBasedRoute>
            }
          />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="follow-ups" element={<FollowUps />} />

          {/* Reports */}
          <Route
            path="reports"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'HR']}>
                <ReportsPage />
              </RoleBasedRoute>
            }
          />

          {/* Leave Management */}
          <Route
            path="leave-management"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Employee', 'Manager', 'Sales']}>
                <LeaveManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <RoleBasedRoute allowedRoles={['Employee']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* Sales Rep Commissions View */}
          <Route
            path="payroll-commissions"
            element={
              <RoleBasedRoute allowedRoles={['Sales']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* HR Management Dashboard Engine View */}
          <Route
            path="payroll-management"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* Manager Budget Overview Analytics View */}
          <Route
            path="payroll-budgets"
            element={
              <RoleBasedRoute allowedRoles={['Manager']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="notifications"
            element={<NotificationsPage />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<SettingsPage />}
          />

          {/* Individual Admin Sections */}
          <Route
            path="admin/users"
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <UserManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="admin/roles-permissions"
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <RolesPermissionsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <AuditLogsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="admin/integrations"
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <IntegrationsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="admin/backups"
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <BackupRestorePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="admin/support"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Employee', 'Manager', 'Sales']}>
                <HelpSupportPage />
              </RoleBasedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="unauthorized"
            element={<UnauthorizedPage />}
          />

          {/* Invalid Route */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />

        </Route>
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;