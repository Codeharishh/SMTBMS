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
import BarcodeQRManagementPage from './pages/BarcodeQRManagementPage';
import StockMonitoringPage from './pages/StockMonitoringPage';
import EmployeeDirectoryPage from './pages/EmployeeDirectoryPage';
import AttendanceTrackerPage from './pages/AttendanceTrackerPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import PerformanceReviewsPage from './pages/PerformanceReviewsPage';
import RecruitmentPage from './pages/RecruitmentPage';
import TrainingTrackerPage from './pages/TrainingTrackerPage';
import HolidayCalendarPage from './pages/HolidayCalendarPage';
import HRDocumentsPage from './pages/HRDocumentsPage';
import ProcurementManagementPage from './pages/ProcurementManagementPage';
import FinancialOperationsPage from './pages/FinancialOperationsPage';
import OrderManagementPage from './pages/OrderManagementPage';
import CustomerDataHubPage from './pages/CustomerDataHubPage';
import LeadManagementCenterPage from './pages/LeadManagementCenterPage';
import SupportDeskPage from './pages/SupportDeskPage';
import SalesPipelineOverviewPage from './pages/SalesPipelineOverviewPage';
import SalesOpportunitiesPage from './pages/SalesOpportunitiesPage';
import SalesQuotationsPage from './pages/SalesQuotationsPage';
import SalesTargetsPage from './pages/SalesTargetsPage';
import SalesRevenueTrackingPage from './pages/SalesRevenueTrackingPage';
import TeamMonitoringPage from './pages/TeamMonitoringPage';
import TaskAssignmentPage from './pages/TaskAssignmentPage';
import ProjectTrackingPage from './pages/ProjectTrackingPage';
import ApprovalsPage from './pages/ApprovalsPage';
import EmployeeProjectsPage from './pages/EmployeeProjectsPage';
import EmployeeTrainingPage from './pages/EmployeeTrainingPage';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage';
import OCRScannerPage from './pages/OCRScannerPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

          {/* OCR Scanner */}
          <Route
            path="ocr-scanner"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <OCRScannerPage />
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

          <Route
            path="customers"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Sales', 'Manager']}>
                <CustomerDataHubPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="crm/leads"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Sales', 'Manager']}>
                <LeadManagementCenterPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="crm/support"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Sales', 'Manager']}>
                <SupportDeskPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="crm/pipeline"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Sales', 'Manager']}>
                <SalesPipelineOverviewPage />
              </RoleBasedRoute>
            }
          />

          {/* Sales Workspace */}
          <Route
            path="sales/opportunities"
            element={
              <RoleBasedRoute allowedRoles={['Sales', 'Admin', 'Manager', 'HR', 'Employee', 'Finance']}>
                <SalesOpportunitiesPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="sales/quotations"
            element={
              <RoleBasedRoute allowedRoles={['Sales', 'Admin', 'Manager', 'HR', 'Employee', 'Finance']}>
                <SalesQuotationsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="sales/followups"
            element={
              <RoleBasedRoute allowedRoles={['Sales', 'Admin', 'Manager', 'HR', 'Employee', 'Finance']}>
                <FollowUps />
              </RoleBasedRoute>
            }
          />
          <Route
            path="sales/targets"
            element={
              <RoleBasedRoute allowedRoles={['Sales', 'Admin', 'Manager', 'HR', 'Employee', 'Finance']}>
                <SalesTargetsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="sales/revenue"
            element={
              <RoleBasedRoute allowedRoles={['Sales', 'Admin', 'Manager', 'HR', 'Employee', 'Finance']}>
                <SalesRevenueTrackingPage />
              </RoleBasedRoute>
            }
          />

          {/* Materials */}
          <Route
            path="materials"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <MaterialsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="barcode-qr"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <BarcodeQRManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="stock-monitoring"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <StockMonitoringPage />
              </RoleBasedRoute>
            }
          />

          {/* HRMS Dedicated Pages */}
          <Route
            path="hrms"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <EmployeeDirectoryPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/directory"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <EmployeeDirectoryPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/attendance"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <AttendanceTrackerPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/leaves"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <LeaveManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/performance"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <PerformanceReviewsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/recruitment"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <RecruitmentPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="employee/projects"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'Admin', 'HR', 'Manager', 'Sales']}>
                <EmployeeProjectsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="employee/training"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'Admin', 'HR', 'Manager', 'Sales']}>
                <EmployeeTrainingPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/training"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                <TrainingTrackerPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/holidays"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <HolidayCalendarPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="hrms/documents"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <HRDocumentsPage />
              </RoleBasedRoute>
            }
          />

          {/* ERP */}
          <Route
            path="erp"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'Finance']}>
                <ERPPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="erp/procurement"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'Finance']}>
                <ProcurementManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="erp/finance"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'Finance']}>
                <FinancialOperationsPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="erp/orders"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Sales', 'Finance']}>
                <OrderManagementPage />
              </RoleBasedRoute>
            }
          />

          {/* Manager Workspace (Only accessible by Manager & Admin) */}
          <Route
            path="manager/team"
            element={
              <RoleBasedRoute allowedRoles={['Manager', 'Admin']}>
                <TeamMonitoringPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="manager/tasks"
            element={
              <RoleBasedRoute allowedRoles={['Manager', 'Admin']}>
                <TaskAssignmentPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="manager/projects"
            element={
              <RoleBasedRoute allowedRoles={['Manager', 'Admin']}>
                <ProjectTrackingPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="manager/approvals"
            element={
              <RoleBasedRoute allowedRoles={['Manager', 'Admin']}>
                <ApprovalsPage />
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
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'HR', 'Sales']}>
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
            path="employee/attendance"
            element={
              <RoleBasedRoute allowedRoles={['Employee', 'Sales', 'HR', 'Manager', 'Admin']}>
                <EmployeeAttendancePage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="employee/leave"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <LeaveManagementPage />
              </RoleBasedRoute>
            }
          />
          {/* Payroll Routes */}
          <Route
            path="payroll"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* Sales Rep Commissions View */}
          <Route
            path="payroll-commissions"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* HR Management Dashboard Engine View */}
          <Route
            path="payroll-management"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
                <PayrollPage />
              </RoleBasedRoute>
            }
          />

          {/* Manager Budget Overview Analytics View */}
          <Route
            path="payroll-budgets"
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'HR', 'Manager', 'Employee', 'Sales']}>
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