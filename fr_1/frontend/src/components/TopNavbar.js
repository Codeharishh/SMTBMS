// src/components/TopNavbar.js
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const THIN_ICONS = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path vectorEffect="non-scaling-stroke" d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  calendar: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  bot: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="11" width="18" height="10" rx="2" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="5" r="2" />
      <path vectorEffect="non-scaling-stroke" d="M12 7v4" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="16" x2="8" y2="16" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
};

// Global Search Index containing all application modules, tools, and pages
const GLOBAL_SEARCH_INDEX = [
  { title: 'Dashboard', path: '/', category: 'Core', keywords: 'home overview analytics stats telemetry metrics', desc: 'Centralized executive operational dashboard' },
  { title: 'Inventory Register', path: '/materials', category: 'Material Tracking', keywords: 'materials inventory stock items SKUs warehouse', desc: 'All materials catalog and stock levels' },
  { title: 'Material Movements', path: '/materials/movements', category: 'Material Tracking', keywords: 'movements logistics transfers inbound outbound stock', desc: 'Internal movements, transfers & receipts' },
  { title: 'Stock Monitoring', path: '/stock-monitoring', category: 'Material Tracking', keywords: 'stock health alerts low stock distribution reorder', desc: 'Real-time stock health & health alerts' },
  { title: 'Barcode & QR Management', path: '/barcode-qr', category: 'Material Tracking', keywords: 'barcode qr code scanning printer thermal labels', desc: 'Generate & scan material barcode/QR labels' },
  { title: 'Employee Directory', path: '/hrms/employees', category: 'HRMS', keywords: 'employees staff directory workforce profiles users', desc: 'Personnel profiles, roles & contact records' },
  { title: 'Attendance Tracker', path: '/hrms/attendance', category: 'HRMS', keywords: 'attendance check-in punch roster shift hours', desc: 'Daily attendance logs & check-in status' },
  { title: 'Leave Management', path: '/hrms/leaves', category: 'HRMS', keywords: 'leave apply time off vacation sick leave balance', desc: 'Apply leave, approvals & balance history' },
  { title: 'Performance Reviews', path: '/hrms/performance', category: 'HRMS', keywords: 'performance review KPI rating appraisal feedback', desc: 'Quarterly reviews, KPIs & goal tracking' },
  { title: 'Recruitment Portal', path: '/hrms/recruitment', category: 'HRMS', keywords: 'recruitment jobs applicants candidates hiring pipeline', desc: 'Job postings & applicant candidate pipeline' },
  { title: 'Training & Development', path: '/hrms/training', category: 'HRMS', keywords: 'training courses skills certification learning', desc: 'Employee training programs & progress' },
  { title: 'Holiday Calendar', path: '/hrms/holidays', category: 'HRMS', keywords: 'holidays calendar company events days off 2026', desc: 'Annual company holiday schedule' },
  { title: 'HR Documents', path: '/hrms/documents', category: 'HRMS', keywords: 'documents policy repository forms contracts handbooks', desc: 'Central repository for HR policies & files' },
  { title: 'Corporate Payroll', path: '/payroll', category: 'HRMS', keywords: 'payroll salary payslips compensation earnings bonus', desc: 'Staff payroll disbursement & salary logs' },
  { title: 'Manager Workspace', path: '/erp', category: 'ERP Workspace', keywords: 'manager erp workspace roster project tracking tasks', desc: 'Centralized manager operations terminal' },
  { title: 'Procurement Management', path: '/erp/procurement', category: 'ERP Workspace', keywords: 'procurement PO purchase orders suppliers buying', desc: 'Purchase orders & supplier purchasing' },
  { title: 'Financial Operations', path: '/finance', category: 'ERP Workspace', keywords: 'finance budget accounts ledger revenue payables', desc: 'Budgets, revenue & transaction ledgers' },
  { title: 'Team Monitoring', path: '/erp/team', category: 'ERP Workspace', keywords: 'team monitoring live tracking status efficiency', desc: 'Live team status & member efficiency' },
  { title: 'Task Assignment', path: '/erp/tasks', category: 'ERP Workspace', keywords: 'tasks task tokens assign workflow priorities due date', desc: 'Assign & track task tokens dynamically' },
  { title: 'Project Tracking', path: '/erp/projects', category: 'ERP Workspace', keywords: 'projects milestones site budget progress tracking', desc: 'Monitor project progress, sites & budget' },
  { title: 'Approvals Hub', path: '/erp/approvals', category: 'ERP Workspace', keywords: 'approvals pending requests governance decision', desc: 'Review & action pending approval requests' },
  { title: 'Employee Dashboard', path: '/employee', category: 'Employee Workspace', keywords: 'employee dashboard overview personal stats', desc: 'Personal employee dashboard and metrics' },
  { title: 'My Attendance', path: '/employee/attendance', category: 'Employee Workspace', keywords: 'employee attendance punch in out hours check', desc: 'Track your daily check-ins and hours worked' },
  { title: 'My Leaves', path: '/leave-management', category: 'Employee Workspace', keywords: 'employee leave apply time off vacation sick', desc: 'Apply for leaves and view balance' },
  { title: 'My Projects', path: '/employee/projects', category: 'Employee Workspace', keywords: 'employee projects tasks assignments tracking', desc: 'View assigned projects and progress' },
  { title: 'My Training', path: '/employee/training', category: 'Employee Workspace', keywords: 'employee training courses learning skills', desc: 'Access assigned training programs' },
  { title: 'CRM Dashboard', path: '/crm', category: 'CRM', keywords: 'crm leads sales pipeline clients deals deals', desc: 'Client relations & lead pipeline metrics' },
  { title: 'Customer Data Hub', path: '/customers', category: 'CRM', keywords: 'customers clients buyers directory contact accounts', desc: 'Client profiles, company profiles & history' },
  { title: 'Lead Management Center', path: '/crm/leads', category: 'CRM', keywords: 'leads lead management pipeline qualification negotiation', desc: 'Lead cards, negotiation & status matrix' },
  { title: 'Sales Opportunities', path: '/crm/opportunities', category: 'CRM', keywords: 'opportunities sales pipeline deals quotes revenue', desc: 'Active sales deals & pipeline stages' },
  { title: 'Sales Quotations', path: '/crm/quotations', category: 'CRM', keywords: 'quotations quotes pricing proposals estimates sales', desc: 'Generate & send commercial quotes' },
  { title: 'Sales Targets', path: '/crm/targets', category: 'CRM', keywords: 'targets quota goals revenue targets sales rep', desc: 'Monthly sales quotas & achievement index' },
  { title: 'Sales Revenue Tracking', path: '/crm/revenue', category: 'CRM', keywords: 'revenue sales tracking income cashflow forecast', desc: 'Realized sales revenue & cashflow trends' },
  { title: 'Vendors Dashboard', path: '/vendors', category: 'Suppliers', keywords: 'vendors suppliers partner registry ratings On Hold', desc: 'Supplier profiles & vendor rating index' },
  { title: 'Support & Service Desk', path: '/support-desk', category: 'Support', keywords: 'support tickets service desk SLA customer issues', desc: 'Customer ticket resolution & SLA monitoring' },
  { title: 'Help & Support', path: '/support', category: 'Support', keywords: 'help support FAQ knowledge base user manual guide', desc: 'Knowledge base FAQs & system guides' },
  { title: 'User Management', path: '/users', category: 'Admin', keywords: 'users user management credentials roles accounts access', desc: 'Platform credentials & role assignment' },
  { title: 'Roles & Permissions', path: '/roles-permissions', category: 'Admin', keywords: 'roles permissions matrix access control privilege', desc: 'Granular role permissions & matrix' },
  { title: 'System Audit Logs', path: '/audit-logs', category: 'Admin', keywords: 'audit logs security compliance history security events', desc: 'Security audit trail & action logs' },
  { title: 'Notification Centre', path: '/notifications', category: 'Admin', keywords: 'notifications alerts system messages announcements', desc: 'System notification logs & broadcast messages' },
  { title: 'Integrations Gateway', path: '/integrations', category: 'Admin', keywords: 'integrations webhook API slack email gateway webhooks', desc: 'Connect external services & webhooks' },
  { title: 'Backup & Restore', path: '/backup-restore', category: 'Admin', keywords: 'backup restore database snapshot data protection backup', desc: 'Database backups & one-click restore' },
  { title: 'System Settings', path: '/settings', category: 'Admin', keywords: 'settings config preferences theme dark mode system', desc: 'System configuration & preferences' }
];

const TopNavbar = ({ darkMode, setDarkMode, isChatOpen, setIsChatOpen, hasUnreadChat }) => {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const [now, setNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Sync dark-mode class on body element
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Real-time clock — ticks every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dismiss search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userData = useMemo(() => {
    const raw = localStorage.getItem('smtbms_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || 'Admin',
          role: parsed.role || 'User',
        };
      } catch {
        return { name: 'Admin', role: 'User' };
      }
    }
    return { name: 'Admin', role: 'User' };
  }, []);

  // Filter search index dynamically
  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return GLOBAL_SEARCH_INDEX.filter(item => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
      );
    }).slice(0, 7); // Max 7 results
  }, [searchTerm]);

  const handleSelectResult = (path) => {
    navigate(path);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      handleSelectResult(filteredResults[0].path);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Formatted clock values
  const formattedTime = useMemo(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return {
      display: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      ampm,
    };
  }, [now]);

  const formattedDate = useMemo(() => {
    return now.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [now]);

  // User initials avatar
  const initials = useMemo(() => {
    return (userData.name || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [userData.name]);

  return (
    <>
      <style>{`
        /* ── TOPNAV CONTAINER ─────────────────────────────────────────────── */
        .smtbms-topnav {
          position: sticky;
          top: 0;
          z-index: 900;
          background: #ffffff;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ── CENTRE: search bar & dropdown ───────────────────────────────── */
        .smtbms-topnav .tnav-search-wrap {
          flex: 1;
          max-width: 420px;
          position: relative;
        }
        .smtbms-topnav .tnav-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          line-height: 1;
          display: flex;
          align-items: center;
        }
        .smtbms-topnav .tnav-search-input {
          width: 100%;
          height: 38px;
          border-radius: 10px;
          border: 0.5px solid rgba(15, 23, 42, 0.10);
          background: #f9fafb;
          color: #1f2937;
          font-size: 0.84rem;
          font-weight: 500;
          padding: 0 38px 0 38px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .smtbms-topnav .tnav-search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        .smtbms-topnav .tnav-search-input:focus {
          border-color: #5B8DEF;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(91, 141, 239, 0.14);
        }

        /* FLOATING SEARCH DROPDOWN RESULTS */
        .tnav-search-results {
          position: absolute;
          top: 46px;
          left: 0;
          right: 0;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15), 0 2px 8px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          z-index: 1000;
          padding: 8px 0;
        }
        .tnav-search-item {
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .tnav-search-item:hover {
          background-color: #f0f7ff;
        }
        .tnav-search-item-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: #1e293b;
        }
        .tnav-search-item-desc {
          font-size: 0.74rem;
          color: #94a3b8;
        }
        .tnav-search-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          background: #eff6ff;
          color: #3b82f6;
          border: 1px solid #bfdbfe;
        }

        /* ── CLOCK SECTION ───────────────────────────────────────────────── */
        .smtbms-topnav .tnav-clock-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
          flex-shrink: 0;
          padding: 6px 14px;
          background: #f9fafb;
          border: 0.5px solid rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          min-width: 170px;
        }
        .smtbms-topnav .tnav-clock-time {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .smtbms-topnav .tnav-clock-digits {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 1.05rem;
          font-weight: 800;
          color: #1f2937;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .smtbms-topnav .tnav-clock-ampm {
          font-size: 0.65rem;
          font-weight: 700;
          color: #2f6df5;
          letter-spacing: 0.06em;
          margin-bottom: 1px;
        }
        .smtbms-topnav .tnav-clock-date {
          font-size: 0.70rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.01em;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ── RIGHT ACTIONS ───────────────────────────────────────────────── */
        .smtbms-topnav .tnav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Bell icon */
        .smtbms-topnav .tnav-bell {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #f9fafb;
          border: 0.5px solid rgba(15, 23, 42, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.15s ease;
          color: #475569;
        }
        .smtbms-topnav .tnav-bell:hover {
          background: #eef2ff;
          border-color: rgba(47, 109, 245, 0.2);
          color: #2563eb;
          transform: translateY(-1px);
        }
        .smtbms-topnav .tnav-bell-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #ffffff;
          animation: tnav-pulse 2s ease infinite;
        }
        @keyframes tnav-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.88); }
        }

        /* Avatar with role pill */
        .smtbms-topnav .tnav-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 6px;
          border-radius: 12px;
          background: #f9fafb;
          border: 0.5px solid rgba(15, 23, 42, 0.08);
          cursor: default;
          transition: background 0.15s ease;
        }
        .smtbms-topnav .tnav-avatar-wrap:hover {
          background: #f0f4ff;
          border-color: rgba(47, 109, 245, 0.15);
        }
        .smtbms-topnav .tnav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #5B8DEF, #4FC3F7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }
        .smtbms-topnav .tnav-avatar-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
        }
        .smtbms-topnav .tnav-avatar-role {
          font-size: 0.68rem;
          font-weight: 600;
          color: #2f6df5;
          line-height: 1;
        }

        /* ── RESPONSIVE HIDE ─────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .smtbms-topnav .tnav-clock-wrap { display: none; }
          .smtbms-topnav .tnav-avatar-name,
          .smtbms-topnav .tnav-avatar-role { display: none; }
        }
        @media (max-width: 640px) {
          .smtbms-topnav .tnav-search-wrap { max-width: 180px; }
        }
      `}</style>

      <header className="smtbms-topnav">
        {/* CENTRE — Search Bar with Live Interactive Results Matrix */}
        <div className="tnav-search-wrap" ref={searchContainerRef}>
          <span className="tnav-search-icon">{THIN_ICONS.search}</span>
          <input
            id="topnav-global-search"
            type="text"
            className="tnav-search-input"
            placeholder="Search pages, modules, tools…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* FLOATING RESULTS DROPDOWN */}
          {isOpen && searchTerm.trim().length > 0 && (
            <div className="tnav-search-results animate__animated animate__fadeIn">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="tnav-search-item"
                    onClick={() => handleSelectResult(item.path)}
                  >
                    <div>
                      <div className="tnav-search-item-title">{item.title}</div>
                      <div className="tnav-search-item-desc">{item.desc}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="tnav-search-badge">{item.category}</span>
                      <span style={{ color: '#3b82f6' }}>{THIN_ICONS.arrowRight}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted small">
                  No matching pages found for "{searchTerm}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Clock + actions */}
        <div className="tnav-actions">
          {/* Real-time Digital Clock + Date */}
          <div className="tnav-clock-wrap" title={formattedDate}>
            <div className="tnav-clock-time">
              <span className="tnav-clock-digits">{formattedTime.display}</span>
              <span className="tnav-clock-ampm">{formattedTime.ampm}</span>
            </div>
            <span className="tnav-clock-date">
              {THIN_ICONS.calendar} {formattedDate}
            </span>
          </div>

          {/* AI Chatbot Launcher Button */}
          <div
            className="tnav-bell"
            title="AI Assistant"
            id="topnav-ai-chat"
            onClick={() => setIsChatOpen && setIsChatOpen(prev => !prev)}
          >
            {THIN_ICONS.bot}
            {hasUnreadChat && !isChatOpen && (
              <span className="tnav-bell-dot" />
            )}
          </div>

          {/* Notification Bell */}
          <div
            className="tnav-bell"
            title="Notifications"
            id="topnav-notifications"
            onClick={() => navigate('/notifications')}
          >
            {THIN_ICONS.bell}
            <span className="tnav-bell-dot" />
          </div>

          {/* User Avatar Chip */}
          <div className="tnav-avatar-wrap">
            <div className="tnav-avatar">{initials}</div>
            <div>
              <div className="tnav-avatar-name">{userData.name}</div>
              <div className="tnav-avatar-role">{userData.role}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavbar;