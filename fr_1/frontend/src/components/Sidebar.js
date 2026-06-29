// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchPayrollHistory } from '../services/payrollService';

const menuItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/materials', label: 'Material Tracking', icon: '📦', roles: ['Admin', 'Manager'] },
  { to: '/material-movements', label: 'Material Movements', icon: '🔄', roles: ['Admin', 'Manager'] },
  { to: '/hrms', label: 'HRMS', icon: '👤', roles: ['Admin', 'HR'] },
  { to: '/erp', label: 'ERP', icon: '🏭', roles: ['Admin', 'Manager'] },
  { to: '/vendors', label: 'Vendors', icon: '🏢', roles: ['Admin', 'Manager'] },
  { to: '/crm', label: 'CRM', icon: '🛡️', roles: ['Admin', 'Sales'] },
  { to: '/follow-ups', label: 'Sales Follow-ups', icon: '📞', roles: ['Sales'] },
  { to: '/customers', label: 'Customer Ledger', icon: '👥', roles: ['Admin', 'Sales'] },
  { to: '/reports', label: 'Reports & Analytics', icon: '📊', roles: ['Admin', 'Manager', 'HR'] },
  { to: '/payroll', label: 'My Payslips', icon: '💳', roles: ['Employee'], isPayroll: true },
  { to: '/payroll-commissions', label: 'Commissions & Pay', icon: '💳', roles: ['Sales'], isPayroll: true },
  { to: '/payroll-management', label: 'Run Monthly Payroll', icon: '💳', roles: ['HR', 'Admin'], isPayroll: true },
  { to: '/payroll-budgets', label: 'Team Expenditure', icon: '💳', roles: ['Manager'], isPayroll: true },
  { to: '/leave-management', label: 'Leave Management', icon: '📅', roles: ['Employee', 'HR', 'Manager', 'Sales'] },
  { to: '/admin/users', label: 'User Management', icon: '👥', roles: ['Admin'] },
  { to: '/admin/roles-permissions', label: 'Roles & Permissions', icon: '🛡️', roles: ['Admin'] },
  { to: '/notifications', label: 'Notifications', icon: '🔔', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/settings', label: 'System Settings', icon: '⚙️', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📋', roles: ['Admin'] },
  { to: '/admin/integrations', label: 'Integrations', icon: '🔗', roles: ['Admin'] },
  { to: '/admin/backups', label: 'Backup & Restore', icon: '🔄', roles: ['Admin'] },
  { to: '/admin/support', label: 'Help & Support', icon: '❓', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
];

const Sidebar = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [hasPayrollAlert, setHasPayrollAlert] = useState(false);

  useEffect(() => {
    if (!user?.role) { setHasPayrollAlert(false); return; }
    const checkPayrollStatus = async () => {
      try {
        const history = await fetchPayrollHistory();
        if (!history || !Array.isArray(history)) return;
        if (user.role === 'Admin') {
          setHasPayrollAlert(history.some(i => i.payment_status === 'Pending'));
        } else if (user.role === 'Employee' || user.role === 'Sales') {
          setHasPayrollAlert(history.some(i => i.payment_status === 'Paid'));
        }
      } catch (err) {
        console.warn('Sidebar payroll check skipped:', err.message);
      }
    };
    checkPayrollStatus();
    const interval = setInterval(checkPayrollStatus, 15000);
    return () => clearInterval(interval);
  }, [user?.role, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('smtbms_token');
    localStorage.removeItem('smtbms_user');
    navigate('/login');
  };

  const allowedMenuItems = menuItems.filter(
    item => user && item.roles.includes(user.role)
  );

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Role display label
  const roleLabel = {
    Admin: 'Super Admin',
    HR: 'HR Manager',
    Manager: 'Manager',
    Employee: 'Employee',
    Sales: 'Sales Rep',
  }[user?.role] || 'User';

  return (
    <>
      <style>{`
        .smtbms-sidebar {
          width: 260px;
          min-height: 100vh;
          background: linear-gradient(180deg, #0f1729 0%, #111827 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 100;
          box-shadow: 4px 0 24px rgba(0,0,0,0.25);
          overflow: hidden;
        }

        /* LOGO */
        .smtbms-logo {
          padding: 22px 20px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .smtbms-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
          flex-shrink: 0;
        }
        .smtbms-logo-text {
          font-size: 1.15rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.04em;
        }

        /* USER PROFILE */
        .smtbms-profile {
          padding: 16px 20px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .smtbms-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.88rem; font-weight: 800; color: #fff;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.15);
        }
        .smtbms-profile-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          line-height: 1.2;
        }
        .smtbms-profile-role {
          font-size: 0.72rem;
          color: #94a3b8;
          margin: 2px 0 0;
        }
        .smtbms-online-dot {
          width: 8px; height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          box-shadow: 0 0 6px rgba(16,185,129,0.7);
          animation: pulse-online 2s ease infinite;
        }
        @keyframes pulse-online {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.7; transform:scale(0.85); }
        }

        /* NAV SCROLL AREA */
        .smtbms-nav {
          flex: 1;
          overflow-y: auto;
          padding: 10px 12px;
          scrollbar-width: none;
        }
        .smtbms-nav::-webkit-scrollbar { display: none; }

        /* SECTION LABEL */
        .smtbms-section-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #475569;
          padding: 12px 8px 4px;
        }

        /* NAV LINK */
        .smtbms-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #94a3b8;
          font-size: 0.86rem;
          font-weight: 500;
          margin-bottom: 1px;
          transition: all 0.17s ease;
          position: relative;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .smtbms-link:hover {
          background: rgba(255,255,255,0.06);
          color: #f1f5f9;
          border-color: rgba(255,255,255,0.06);
        }
        .smtbms-link.active {
          background: linear-gradient(135deg, rgba(59,130,246,0.22), rgba(99,102,241,0.18));
          color: #ffffff;
          font-weight: 700;
          border-color: rgba(99,102,241,0.3);
          box-shadow: 0 2px 10px rgba(59,130,246,0.15);
        }
        .smtbms-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #3b82f6, #6366f1);
          border-radius: 0 3px 3px 0;
        }
        .smtbms-link-icon {
          font-size: 1rem;
          width: 22px;
          text-align: center;
          flex-shrink: 0;
          opacity: 0.8;
        }
        .smtbms-link.active .smtbms-link-icon { opacity: 1; }
        .smtbms-link-label { flex: 1; }
        .smtbms-link-arrow {
          font-size: 0.65rem;
          opacity: 0.35;
          transition: opacity 0.17s;
        }
        .smtbms-link:hover .smtbms-link-arrow,
        .smtbms-link.active .smtbms-link-arrow { opacity: 0.7; }

        /* ALERT DOT */
        .smtbms-alert-dot {
          width: 7px; height: 7px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(239,68,68,0.6);
          flex-shrink: 0;
        }

        /* LOGOUT BUTTON */
        .smtbms-footer {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .smtbms-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #f87171;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.17s ease;
          border: 1px solid transparent;
          background: transparent;
          width: 100%;
        }
        .smtbms-logout:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.2);
          color: #ef4444;
        }
      `}</style>

      <aside className="smtbms-sidebar">

        {/* LOGO */}
        <div className="smtbms-logo">
          <div className="smtbms-logo-icon">💎</div>
          <span className="smtbms-logo-text">SMTBMS</span>
        </div>

        {/* USER PROFILE */}
        <div className="smtbms-profile">
          <div className="smtbms-avatar">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="smtbms-profile-name">{user?.name || 'User'}</p>
            <p className="smtbms-profile-role">
              <span className="smtbms-online-dot"></span>
              {roleLabel}
            </p>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="smtbms-nav">
          {allowedMenuItems.map(item => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={true}
              className={({ isActive }) => `smtbms-link${isActive ? ' active' : ''}`}
            >
              <span className="smtbms-link-icon">{item.icon}</span>
              <span className="smtbms-link-label">{item.label}</span>
              {item.isPayroll && hasPayrollAlert && (
                <span className="smtbms-alert-dot" title="Pending action"></span>
              )}
              <span className="smtbms-link-arrow">›</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="smtbms-footer">
          <button className="smtbms-logout" onClick={handleLogout}>
            <span style={{ fontSize: '1rem' }}>↪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;