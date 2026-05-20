import { NavLink } from 'react-router-dom';
import { getCurrentUser } from '../utils/authHelpers';

const menuItems = [
  { to: '/', label: 'Dashboard', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'], end: true },
  { to: '/materials', label: 'Material Tracking', roles: ['Admin', 'Manager', 'Employee'] },
  { to: '/hrms', label: 'HRMS', roles: ['Admin', 'HR'] },
  { to: '/erp', label: 'ERP', roles: ['Admin', 'Manager'] },
  { to: '/crm', label: 'CRM', roles: ['Admin', 'Sales'] },
  { to: '/reports', label: 'Reports', roles: ['Admin', 'Manager', 'HR'] },
  { to: '/notifications', label: 'Notifications', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/settings', label: 'Settings', roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
];

const Sidebar = ({ darkMode }) => {
  const user = getCurrentUser();
  const linkClass = ({ isActive }) => `nav-link d-flex align-items-center py-2 px-3 ${isActive ? 'active' : ''}`;
  const allowedMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="sidebar d-flex flex-column p-3">
      <div className="mb-4">
        <h4 className="mb-1">SMTBMS</h4>
        <small className="text-muted">{user ? `${user.role} workspace` : 'Enterprise Operations'}</small>
      </div>
      <nav className="nav flex-column gap-1">
        {allowedMenuItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.end || false}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-3 border-top">
        <small className="text-muted">Role-based analytics and operations.</small>
      </div>
    </aside>
  );
};

export default Sidebar;
