// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/authHelpers';
import { fetchPayrollHistory } from '../services/payrollService';

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX ──────────────────────────────────────
// Same visual language as MaterialsPage.js THIN_ICONS: stroke-based, uses
// currentColor so hover/active states recolor automatically via CSS.
const THIN_ICONS = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="3" width="7" height="7" />
      <rect vectorEffect="non-scaling-stroke" x="14" y="3" width="7" height="7" />
      <rect vectorEffect="non-scaling-stroke" x="14" y="14" width="7" height="7" />
      <rect vectorEffect="non-scaling-stroke" x="3" y="14" width="7" height="7" />
    </svg>
  ),
  box: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline vectorEffect="non-scaling-stroke" points="3.27 6.96 12 12.01 20.73 6.96" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  refresh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 4 23 10 17 10" />
      <polyline vectorEffect="non-scaling-stroke" points="1 20 1 14 7 14" />
      <path vectorEffect="non-scaling-stroke" d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="7" r="4" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  layers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 2 7 12 12 22 7 12 2" />
      <polyline vectorEffect="non-scaling-stroke" points="2 17 12 22 22 17" />
      <polyline vectorEffect="non-scaling-stroke" points="2 12 12 17 22 12" />
    </svg>
  ),
  building: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="4" y="9" width="7" height="12" />
      <rect vectorEffect="non-scaling-stroke" x="13" y="3" width="7" height="18" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="13" x2="7" y2="13.01" />
      <line vectorEffect="non-scaling-stroke" x1="7" y1="17" x2="7" y2="17.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="7" x2="16" y2="7.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="11" x2="16" y2="11.01" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="15" x2="16" y2="15.01" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  barChart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="18" y1="20" x2="18" y2="10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="20" x2="12" y2="4" />
      <line vectorEffect="non-scaling-stroke" x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  creditCard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path vectorEffect="non-scaling-stroke" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="3" />
      <path vectorEffect="non-scaling-stroke" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  clipboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect vectorEffect="non-scaling-stroke" x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path vectorEffect="non-scaling-stroke" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  barcode: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14" />
    </svg>
  ),
  activity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  helpCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <path vectorEffect="non-scaling-stroke" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  fileText: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="6" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="2" />
    </svg>
  ),
  checkCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  trendingUp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline vectorEffect="non-scaling-stroke" points="17 6 23 6 23 12" />
    </svg>
  ),
  graduationCap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path vectorEffect="non-scaling-stroke" d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  folder: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="6 9 12 15 18 9" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline vectorEffect="non-scaling-stroke" points="16 17 21 12 16 7" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};

const menuItems = [
  { to: '/', label: 'Dashboard', icon: THIN_ICONS.grid, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  {
    label: 'Material Tracking',
    icon: THIN_ICONS.box,
    roles: ['Admin', 'Manager'],
    isDropdown: true,
    dropdownKey: 'material',
    subItems: [
      { to: '/materials', label: 'Inventory' },
      { to: '/material-movements', label: 'Movement Tracking' },
      { to: '/stock-monitoring', label: 'Stock Monitoring' },
      { to: '/barcode-qr', label: 'Barcode / QR' },
    ]
  },
  {
    label: 'ERP Workspace',
    icon: THIN_ICONS.briefcase,
    roles: ['Admin', 'Manager'],
    isDropdown: true,
    dropdownKey: 'erp',
    subItems: [
      { to: '/erp/procurement', label: 'Procurement Management' },
      { to: '/erp/finance', label: 'Financial Operations' },
      { to: '/erp/orders', label: 'Order Management' },
      { to: '/vendors', label: 'Vendor Management' },
    ]
  },
  {
    label: 'HRMS',
    icon: THIN_ICONS.user,
    roles: ['Admin', 'HR'],
    isDropdown: true,
    dropdownKey: 'hrms',
    subItems: [
      { to: '/hrms/directory', label: 'Employee Directory' },
      { to: '/hrms/attendance', label: 'Attendance Tracker' },
      { to: '/hrms/leaves', label: 'Leave Management' },
      { to: '/hrms/performance', label: 'Performance Reviews' },
      { to: '/hrms/recruitment', label: 'Recruitment Portal' },
      { to: '/hrms/training', label: 'Training Tracker' },
      { to: '/hrms/holidays', label: 'Holiday Calendar' },
      { to: '/hrms/documents', label: 'HR Documents' },
      { to: '/payroll', label: 'Payroll' },
    ]
  },
  { to: '/leave-management', label: 'My Leaves', icon: THIN_ICONS.clipboard, roles: ['Employee', 'Sales'] },
  { to: '/employee/projects', label: 'Projects', icon: THIN_ICONS.folder, roles: ['Employee'] },
  { to: '/payroll', label: 'Payslips', icon: THIN_ICONS.creditCard, roles: ['Employee'] },
  { to: '/employee/training', label: 'Training', icon: THIN_ICONS.graduationCap, roles: ['Employee'] },
  {
    label: 'CRM',
    icon: THIN_ICONS.shield,
    roles: ['Admin', 'Sales', 'Manager'],
    isDropdown: true,
    dropdownKey: 'crm',
    subItems: [
      { to: '/crm/leads', label: 'Lead Management' },
      { to: '/customers', label: 'Customer Data Hub' },
      { to: '/crm/support', label: 'Support & Service Desk' },
      { to: '/crm/pipeline', label: 'Sales Pipeline Overview' },
    ]
  },
  { to: '/sales/opportunities', label: 'Opportunities', icon: THIN_ICONS.briefcase, roles: ['Sales'] },
  { to: '/sales/quotations', label: 'Quotations', icon: THIN_ICONS.fileText, roles: ['Sales'] },
  { to: '/sales/followups', label: 'Customer Follow-ups', icon: THIN_ICONS.user, roles: ['Sales'] },
  { to: '/sales/targets', label: 'Sales Targets', icon: THIN_ICONS.target, roles: ['Sales'] },
  { to: '/sales/revenue', label: 'Revenue Tracking', icon: THIN_ICONS.trendingUp, roles: ['Sales'] },
  { to: '/manager/team', label: 'Team Monitoring', icon: THIN_ICONS.users, roles: ['Manager'] },
  { to: '/manager/tasks', label: 'Task Assignment', icon: THIN_ICONS.clipboard, roles: ['Manager'] },
  { to: '/manager/projects', label: 'Project Tracking', icon: THIN_ICONS.building, roles: ['Manager'] },
  { to: '/manager/approvals', label: 'Approvals', icon: THIN_ICONS.checkCircle, roles: ['Manager'] },
  { to: '/reports', label: 'Reports & Analytics', icon: THIN_ICONS.barChart, roles: ['Admin', 'Manager', 'HR', 'Sales'] },
  { to: '/payroll-commissions', label: 'Commissions & Pay', icon: THIN_ICONS.creditCard, roles: ['Sales'], isPayroll: true },
  { to: '/admin/users', label: 'User Management', icon: THIN_ICONS.users, roles: ['Admin'] },
  { to: '/admin/roles-permissions', label: 'Roles & Permissions', icon: THIN_ICONS.shield, roles: ['Admin'] },
  { to: '/notifications', label: 'Notifications', icon: THIN_ICONS.bell, roles: ['Admin'] },
  { to: '/settings', label: 'System Settings', icon: THIN_ICONS.settings, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: THIN_ICONS.clipboard, roles: ['Admin'] },
  { to: '/admin/integrations', label: 'Integrations', icon: THIN_ICONS.link, roles: ['Admin'] },
  { to: '/admin/backups', label: 'Backup & Restore', icon: THIN_ICONS.refresh, roles: ['Admin'] },
  { to: '/admin/support', label: 'Help & Support', icon: THIN_ICONS.helpCircle, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Sales'] },
];

const Sidebar = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPayrollAlert, setHasPayrollAlert] = useState(false);

  // Auto-expand dropdown if any child subItem route is currently active
  const isMaterialChildActive = ['/materials', '/material-movements', '/stock-monitoring', '/barcode-qr'].includes(location.pathname);
  const isHrmsChildActive = ['/hrms', '/hrms/directory', '/hrms/attendance', '/hrms/leaves', '/hrms/performance', '/payroll', '/payroll-management'].includes(location.pathname);
  const isCrmChildActive = ['/crm/leads', '/customers', '/crm/support', '/crm/pipeline'].includes(location.pathname);
  const isErpChildActive = ['/erp/procurement', '/erp/finance', '/erp/orders', '/vendors'].includes(location.pathname);
  const isManagerChildActive = ['/manager/team', '/manager/tasks', '/manager/projects', '/manager/approvals'].includes(location.pathname);

  const [openDropdowns, setOpenDropdowns] = useState({
    material: isMaterialChildActive,
    hrms: isHrmsChildActive,
    crm: isCrmChildActive,
    erp: isErpChildActive,
    manager: isManagerChildActive
  });

  useEffect(() => {
    if (isMaterialChildActive) {
      setOpenDropdowns(prev => ({ ...prev, material: true }));
    }
    if (isHrmsChildActive) {
      setOpenDropdowns(prev => ({ ...prev, hrms: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.role) { setHasPayrollAlert(false); return; }
    const checkPayrollStatus = async () => {
      try {
        const history = await fetchPayrollHistory();
        if (!history || !Array.isArray(history)) return;

        // FIXED: Case-insensitive conditional check for background updates
        const currentUpperRole = user.role.toUpperCase();
        if (currentUpperRole === 'ADMIN') {
          setHasPayrollAlert(history.some(i => i.payment_status === 'Pending'));
        } else if (currentUpperRole === 'EMPLOYEE' || currentUpperRole === 'SALES') {
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

  // FIXED: Maps allowed menu items case-insensitively using uppercase array structures
  const allowedMenuItems = menuItems.filter(
    item => user && item.roles.map(r => r.toUpperCase()).includes(user.role.toUpperCase())
  );

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // FIXED: Role display mapped strictly to standardized uppercase criteria keys
  const roleLabel = {
    ADMIN: 'Super Admin',
    HR: 'HR Manager',
    MANAGER: 'Manager',
    EMPLOYEE: 'Employee',
    SALES: 'Sales Rep',
  }[user?.role?.toUpperCase()] || 'User';

  return (
    <>
      {/* 🟢 SPECIFICITY SPECIFICATION OVERRIDES TO PREVENT GLOBAL THEME CLASHING OVERLAYS */}
      <style>{`
        .smtbms-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #0b0f19 !important;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 1000 !important;
          box-shadow: 4px 0 24px rgba(0,0,0,0.35);
          overflow: hidden;
        }

        /* LOGO HEADER STRUCTURES */
        .smtbms-sidebar .smtbms-logo {
          padding: 22px 20px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .smtbms-sidebar .smtbms-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(37,99,235,0.4);
          flex-shrink: 0;
        }
        .smtbms-sidebar .smtbms-logo-text {
          font-size: 1.25rem !important;
          font-weight: 900 !important;
          color: #ffffff !important;
          letter-spacing: 0.05em;
        }

        /* USER PROFILE PLACEMENT LOGS */
        .smtbms-sidebar .smtbms-profile {
          padding: 18px 20px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .smtbms-sidebar .smtbms-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.88rem; font-weight: 800; color: #fff !important;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.2) !important;
        }
        .smtbms-sidebar .smtbms-profile-name {
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          margin: 0;
          line-height: 1.2;
        }
        .smtbms-sidebar .smtbms-profile-role {
          font-size: 0.74rem !important;
          color: #38bdf8 !important;
          font-weight: 600 !important;
          margin: 3px 0 0;
          display: flex;
          align-items: center;
        }
        .smtbms-sidebar .smtbms-online-dot {
          width: 8px; height: 8px;
          background: #10b981 !important;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          box-shadow: 0 0 6px rgba(16,185,129,0.7);
          animation: pulse-online 2s ease infinite;
        }
        @keyframes pulse-online {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.7; transform:scale(0.85); }
        }

        /* SCROLLABLE LINKS LIST REGISTRY CONTAINER */
        .smtbms-sidebar .smtbms-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px;
          scrollbar-width: none;
        }
        .smtbms-sidebar .smtbms-nav::-webkit-scrollbar { display: none; }

        .smtbms-sidebar .smtbms-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          text-decoration: none;
          margin-bottom: 2px;
          transition: all 0.17s ease;
          position: relative;
          cursor: pointer;
          background: transparent !important;
          border: 1px solid transparent !important;
          user-select: none;
        }
        
        /* 🟢 FORCIBLY CAPTURES INTERNAL LETTER RE-COLORING HOOKS AND PREVENTS CASCADING BREAKS */
        .smtbms-sidebar .smtbms-link,
        .smtbms-sidebar .smtbms-link span,
        .smtbms-sidebar .smtbms-link .smtbms-link-label {
          color: #cbd5e1 !important; 
          font-size: 0.88rem !important;
          font-weight: 600 !important;
        }

        .smtbms-sidebar .smtbms-link:hover,
        .smtbms-sidebar .smtbms-link:hover span,
        .smtbms-sidebar .smtbms-link:hover .smtbms-link-label {
          color: #ffffff !important;
        }
        .smtbms-sidebar .smtbms-link:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.04) !important;
        }

        /* ACTIVE ELEMENT RE-RENDERING THEMES */
        .smtbms-sidebar .smtbms-link.active {
          background: linear-gradient(135deg, rgba(234,88,12,0.25), rgba(249,115,22,0.15)) !important;
          border-color: rgba(234,88,12,0.4) !important;
          box-shadow: 0 4px 12px rgba(234,88,12,0.15) !important;
        }
        
        .smtbms-sidebar .smtbms-link.active,
        .smtbms-sidebar .smtbms-link.active span,
        .smtbms-sidebar .smtbms-link.active .smtbms-link-label {
          color: #ffffff !important;
          font-weight: 700 !important;
        }

        .smtbms-sidebar .smtbms-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 3px;
          background: #ea580c !important;
          border-radius: 0 4px 4px 0;
        }
        .smtbms-sidebar .smtbms-link-icon {
          font-size: 1.05rem !important;
          width: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0.9;
        }
        .smtbms-sidebar .smtbms-link.active .smtbms-link-icon { 
          opacity: 1; 
          color: #ff7426 !important; 
        }
        .smtbms-sidebar .smtbms-link-arrow {
          font-size: 0.75rem !important;
          opacity: 0.4;
          color: #cbd5e1 !important;
          transition: transform 0.2s ease;
          display: inline-flex;
          align-items: center;
        }
        .smtbms-sidebar .smtbms-link-arrow.open {
          transform: rotate(180deg);
          opacity: 0.9;
        }
        .smtbms-sidebar .smtbms-link:hover .smtbms-link-arrow,
        .smtbms-sidebar .smtbms-link.active .smtbms-link-arrow { 
          opacity: 0.8; 
          color: #ffffff !important;
        }

        /* SUB-ITEM DROPDOWN STYLES */
        .smtbms-sidebar .smtbms-sub-menu {
          padding-left: 28px;
          margin-top: 2px;
          margin-bottom: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .smtbms-sidebar .smtbms-sub-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #94a3b8 !important;
          font-size: 0.82rem !important;
          font-weight: 600 !important;
          transition: all 0.15s ease;
        }
        .smtbms-sidebar .smtbms-sub-link:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.05) !important;
        }
        .smtbms-sidebar .smtbms-sub-link.active {
          color: #ff7426 !important;
          background: rgba(234,88,12,0.12) !important;
          font-weight: 700 !important;
        }
        .smtbms-sidebar .sub-bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #64748b;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .smtbms-sidebar .smtbms-sub-link.active .sub-bullet-dot {
          background: #ff7426;
          box-shadow: 0 0 6px rgba(255,116,38,0.8);
          transform: scale(1.3);
        }
        .smtbms-sidebar .smtbms-sub-link:hover .sub-bullet-dot {
          background: #ffffff;
        }

        /* COMPLIANCE WARNING DOTS */
        .smtbms-sidebar .smtbms-alert-dot {
          width: 7px; height: 7px;
          background: #ef4444 !important;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(239,68,68,0.6);
          flex-shrink: 0;
        }

        /* DISCONNECT LOGOUT UTILITY */
        .smtbms-sidebar .smtbms-footer {
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,0.08) !important;
        }
        .smtbms-sidebar .smtbms-logout,
        .smtbms-sidebar .smtbms-logout span {
          color: #fca5a5 !important;
          font-size: 0.88rem !important;
          font-weight: 700 !important;
        }
        .smtbms-sidebar .smtbms-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.17s ease;
          border: 1px solid transparent !important;
          background: transparent !important;
          width: 100%;
        }
        .smtbms-sidebar .smtbms-logout:hover,
        .smtbms-sidebar .smtbms-logout:hover span {
          color: #f87171 !important;
        }
        .smtbms-sidebar .smtbms-logout:hover {
          background: rgba(239,68,68,0.14) !important;
          border-color: rgba(239,68,68,0.25) !important;
        }
      `}</style>

      <aside className="smtbms-sidebar">

        {/* LOGO HEADER LAYOUT */}
        <div className="smtbms-logo">
          <div className="smtbms-logo-icon">💎</div>
          <span className="smtbms-logo-text">SMTBMS</span>
        </div>

        {/* PROFILE BADGE NODES */}
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

        {/* DYNAMIC PERMISSIONS LINKS LEDGER LIST */}
        <nav className="smtbms-nav">
          {allowedMenuItems.map(item => {
            if (item.isDropdown) {
              const dKey = item.dropdownKey;
              const isOpen = !!openDropdowns[dKey];
              const isChildActive = item.subItems.some(sub => location.pathname === sub.to || (sub.to !== '/' && location.pathname.startsWith(sub.to)));

              return (
                <div key={item.label}>
                  <div
                    className={`smtbms-link${isChildActive ? ' active' : ''}`}
                    onClick={() => setOpenDropdowns(prev => ({ ...prev, [dKey]: !prev[dKey] }))}
                  >
                    <span className="smtbms-link-icon">{item.icon}</span>
                    <span className="smtbms-link-label" style={{ flex: 1 }}>{item.label}</span>
                    <span className={`smtbms-link-arrow${isOpen ? ' open' : ''}`}>
                      {THIN_ICONS.chevronDown}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="smtbms-sub-menu">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          end={true}
                          className={({ isActive }) => `smtbms-sub-link${isActive ? ' active' : ''}`}
                        >
                          <span className="sub-bullet-dot"></span>
                          <span>{sub.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
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
            );
          })}
        </nav>

        {/* EXIT FOOTER */}
        <div className="smtbms-footer">
          <button className="smtbms-logout" onClick={handleLogout}>
            {THIN_ICONS.logout}
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;