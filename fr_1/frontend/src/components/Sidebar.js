// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchPayrollHistory } from '../services/payrollService';

const menuItems = [
  { to: '/', label: 'Dashboard', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'], end: true },
  { to: '/materials', label: 'Materials Tracking', roles: ['Admin', 'Manager'] },
  { to: '/material-movements', label: 'Material Movements', roles: ['Admin', 'Manager'] },
  { to: '/hrms', label: 'HRMS', roles: ['Admin', 'HR'] },
  { to: '/erp', label: 'ERP', roles: ['Admin', 'Manager'] },
  { to: '/vendors', label: 'Vendors', roles: ['Admin', 'Manager'] },
  { to: '/crm', label: 'CRM', roles: ['Admin', 'Sales'] },
  { to: '/follow-ups', label: 'Sales Follow-ups', roles: ['Sales'] },
  { to: '/customers', label: 'Customer Ledger', roles: ['Admin', 'Sales'] },
  { to: '/reports', label: 'Reports', roles: ['Admin', 'Manager', 'HR'] },
  { to: '/payroll', label: 'My Payslips', roles: ['Employee'], isPayroll: true },
  { to: '/payroll-commissions', label: 'Commissions & Pay', roles: ['Sales'], isPayroll: true },
  { to: '/payroll-management', label: 'Run Monthly Payroll', roles: ['HR', 'Admin'], isPayroll: true },
  { to: '/payroll-budgets', label: 'Team Expenditure', roles: ['Manager'], isPayroll: true },
  { to: '/leave-management', label: 'Leave Management', roles: ['Employee', 'HR', 'Manager', 'Sales'] },
  { to: '/admin/users', label: 'User Management', roles: ['Admin'] },
  { to: '/admin/roles-permissions', label: 'Roles & Permissions', roles: ['Admin'] },
  { to: '/notifications', label: 'Notifications', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/admin/audit-logs', label: 'Audit Logs', roles: ['Admin'] },
  { to: '/admin/integrations', label: 'Integrations', roles: ['Admin'] },
  { to: '/admin/backups', label: 'Backup & Restore', roles: ['Admin'] },
  { to: '/admin/support', label: 'Help & Support', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/settings', label: 'System Settings', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] }
];

const Sidebar = ({ darkMode }) => {
  const user = getCurrentUser();
  const [hasPayrollAlert, setHasPayrollAlert] = useState(false);

  useEffect(() => {
    if (!user || !user.role) {
      setHasPayrollAlert(false);
      return;
    }

    const checkPayrollStatus = async () => {
      try {
        const history = await fetchPayrollHistory();
        if (!history || !Array.isArray(history)) return;

        if (user.role === 'Admin') {
          const hasPendingRequests = history.some(item => item.payment_status === 'Pending');
          setHasPayrollAlert(hasPendingRequests);
        } else if (user.role === 'Employee' || user.role === 'Sales') {
          const hasPaidSlips = history.some(item => item.payment_status === 'Paid');
          setHasPayrollAlert(hasPaidSlips);
        }
      } catch (err) {
        console.warn('Sidebar alert tracking skipped safely:', err.message);
      }
    };

    checkPayrollStatus();
    const interval = setInterval(checkPayrollStatus, 15000);
    return () => clearInterval(interval);
  }, [user?.role, user?.id]);

  const linkClass = ({ isActive }) => `nav-link d-flex align-items-center justify-content-between py-2 px-3 ${isActive ? 'active' : ''}`;
  const allowedMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="sidebar d-flex flex-column p-3" style={{ height: '100vh' }}>
      <div className="mb-4">
        <h4 className="mb-1 fw-bold">SMTBMS</h4>
        <small className="text-muted text-capitalize">{user ? `${user.role.toLowerCase()} workspace` : 'Enterprise Operations'}</small>
      </div>

      <nav className="nav flex-column gap-1 menu-links-wrapper">
        {allowedMenuItems.map((item) => (
          <NavLink key={`${item.to}-${item.label}`} to={item.to} className={linkClass} end={item.end || false}>
            <span>{item.label}</span>

            {item.isPayroll && hasPayrollAlert && (
              <span
                className="rounded-circle bg-danger"
                style={{
                  width: '8px',
                  height: '8px',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #dc3545',
                  transition: 'all 0.3s ease-in-out'
                }}
                title="Pending action records in queue"
              />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-top">
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Role-based enterprise workstation.</small>
      </div>
    </aside>
  );
};

export default Sidebar;