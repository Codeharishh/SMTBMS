// src/pages/RolesPermissionsPage.js
import React, { useState } from 'react';

// ── SAME PALETTE AS MaterialsPage.js FOR VISUAL CONSISTENCY ────────────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF7A45',
  alert: '#FF6B6B'
};

// ── HEADER ICON ──────────────────────────────────────────────────────────
const ICONS = {
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path vectorEffect="non-scaling-stroke" d="M9 12l2 2 4-4" />
    </svg>
  )
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX ────────────────────
const THIN_ICONS = {
  materials: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.indigo }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  hrms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.emerald }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  payroll: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.amber }}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  logs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.slate }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  backups: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.rose }}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  integrations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2" style={{ color: COLORS.sky }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  alertTriangle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#92400e' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
};

const RolesPermissionsPage = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Initial matrix mapping
  const [permissions, setPermissions] = useState({
    Admin: { materials: ['Read', 'Create', 'Edit', 'Delete'], hrms: ['Read', 'Create', 'Edit', 'Delete'], payroll: ['Read', 'Create', 'Edit', 'Delete'], logs: ['Read', 'Export'], backups: ['Create', 'Restore'], integrations: ['Toggle', 'Test'] },
    HR: { materials: ['Read'], hrms: ['Read', 'Create', 'Edit', 'Delete'], payroll: ['Read', 'Create', 'Edit'], logs: ['Read'], backups: [], integrations: [] },
    Manager: { materials: ['Read', 'Create', 'Edit'], hrms: ['Read'], payroll: ['Read'], logs: ['Read'], backups: [], integrations: [] },
    Sales: { materials: ['Read'], hrms: [], payroll: ['Read'], logs: [], backups: [], integrations: [] },
    Employee: { materials: ['Read'], hrms: [], payroll: ['Read'], logs: [], backups: [], integrations: [] }
  });

  const modules = [
    { key: 'materials', icon: THIN_ICONS.materials, label: 'Materials Tracking', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'hrms', icon: THIN_ICONS.hrms, label: 'HRMS Employee Directory', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'payroll', icon: THIN_ICONS.payroll, label: 'Payroll & Financials', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'logs', icon: THIN_ICONS.logs, label: 'System Audit Logs', ops: ['Read', 'Export'] },
    { key: 'backups', icon: THIN_ICONS.backups, label: 'Database Backups', ops: ['Create', 'Restore'] },
    { key: 'integrations', icon: THIN_ICONS.integrations, label: 'Webhook Integrations', ops: ['Toggle', 'Test'] }
  ];

  const handleToggle = (role, moduleKey, operation) => {
    const rolePerms = permissions[role];
    const modulePerms = rolePerms[moduleKey] || [];

    let updated;
    if (modulePerms.includes(operation)) {
      updated = modulePerms.filter(op => op !== operation);
    } else {
      updated = [...modulePerms, operation];
    }

    setPermissions({
      ...permissions,
      [role]: {
        ...rolePerms,
        [moduleKey]: updated
      }
    });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Role access control policy tables updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 800);
  };

  return (
    <div className="theme-materials container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        /* Premium Card Configurations */
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important;
        }
        .hover-btn-lux {
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* INVENTORY REGISTER REFERENCE TABLE IMPLEMENTATION */
        .theme-materials table {
          width: 100% !important;
          border-collapse: collapse !important;
          background-color: #ffffff !important;
        }

        /* Header Style Mapping */
        .theme-materials th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.78rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border-bottom: 2px solid #f1f0f9 !important;
        }

        /* Row Layout Mapping */
        .theme-materials td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          border-bottom: 1px solid #f4f2fb !important;
          color: #4a5568 !important;
          font-size: 0.92rem !important;
        }

        .theme-materials tbody tr {
          transition: background-color 0.15s ease !important;
        }
        .theme-materials tbody tr:hover {
          background-color: #FDFAFF !important;
        }

        .perm-group-box {
          background-color: #FAF8FF !important;
          border: 1px solid #e5e0f5 !important;
          border-radius: 12px;
          transition: all 0.15s ease-in-out;
        }
        .perm-group-box:hover {
          background-color: #F1EDFF !important;
          border-color: ${COLORS.indigo}33 !important;
        }

        /* CUSTOM CHECKBOX VISIBILITY SYSTEM */
        .form-check-input {
          cursor: pointer;
          border: 2px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          width: 17px;
          height: 17px;
          transition: all 0.1s ease-in-out;
        }
        .form-check-input:checked {
          background-color: ${COLORS.primary} !important;
          border-color: ${COLORS.primary} !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M5 10l3 3l7-7'/%3e%3c/svg%3e") !important;
        }

        /* Custom Badge Palette Configs */
        .theme-materials .badge-admin { background-color: ${COLORS.rose}14 !important; color: #dc2626 !important; border: 1px solid ${COLORS.rose}33 !important; }
        .theme-materials .badge-hr { background-color: ${COLORS.emerald}14 !important; color: #0f9488 !important; border: 1px solid ${COLORS.emerald}33 !important; }
        .theme-materials .badge-manager { background-color: ${COLORS.indigo}14 !important; color: ${COLORS.indigo} !important; border: 1px solid ${COLORS.indigo}33 !important; }
        .theme-materials .badge-sales { background-color: ${COLORS.sky}14 !important; color: #0284c7 !important; border: 1px solid ${COLORS.sky}33 !important; }
        .theme-materials .badge-employee { background-color: ${COLORS.slate}14 !important; color: #475569 !important; border: 1px solid ${COLORS.slate}33 !important; }

        .theme-materials .role-badge-base {
          padding: 5px 14px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
          letter-spacing: 0.02em;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
            {ICONS.shield}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Roles & Permissions Matrix</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Configure operational module restrictions and role privileges across the enterprise system</p>
          </div>
        </div>
      </div>

      {/* SUCCESS TOAST STREAM */}
      {successMsg && (
        <div className="alert border-0 text-white shadow-sm mb-4 p-3 d-flex align-items-center justify-content-between rounded-4" style={{ background: `linear-gradient(135deg, ${COLORS.emerald} 0%, #10B981 100%)`, borderRadius: '16px' }}>
          <div className="d-flex align-items-center gap-1">
            {THIN_ICONS.success} <small className="fw-bold">{successMsg}</small>
          </div>
          <button className="btn-close btn-close-white" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* ADMINISTRATIVE SECURITY WARNING */}
      <div className="alert border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3 shadow-sm" style={{ backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fef3c7', borderRadius: '22px' }}>
        <div className="pt-1">{THIN_ICONS.alertTriangle}</div>
        <div>
          <h6 className="fw-bold mb-1" style={{ color: '#92400e', fontSize: '0.9rem' }}>Administrative Gateway Warning</h6>
          <p className="mb-0 small" style={{ color: '#b45309', lineHeight: 1.4 }}>Modifying these parameters alters granular route gateways. Changing permissions does not impact active session cookies until next worker re-authentication cycle.</p>
        </div>
      </div>

      <div className="section-eyebrow">Access Policies</div>

      {/* MAIN CONTAINER SURFACE */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="table-responsive">
          <table className="table align-middle text-center mb-0">
            <thead>
              <tr>
                <th className="text-start ps-4" style={{ width: '280px' }}>System Module Directory</th>
                {Object.keys(permissions).map(role => {
                  const badgeClass = `badge-${role.toLowerCase()}`;
                  return (
                    <th key={role} style={{ minWidth: '160px' }}>
                      <span className={`role-badge-base ${badgeClass}`}>
                        {role}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.key}>
                  <td className="text-start fw-bold text-dark ps-4 d-flex align-items-center" style={{ fontSize: '0.92rem', minHeight: '68px' }}>
                    {mod.icon} {mod.label}
                  </td>
                  {Object.keys(permissions).map(role => {
                    const roleModPerms = permissions[role][mod.key] || [];
                    return (
                      <td key={role} className="p-2">
                        <div className="d-flex flex-column gap-2 text-start p-3 perm-group-box">
                          {mod.ops.map(op => {
                            const isChecked = roleModPerms.includes(op);
                            return (
                              <div key={op} className="form-check mb-0 d-flex align-items-center gap-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`${role}-${mod.key}-${op}`}
                                  checked={isChecked}
                                  onChange={() => handleToggle(role, mod.key, op)}
                                />
                                <label
                                  htmlFor={`${role}-${mod.key}-${op}`}
                                  className="form-check-label small fw-bold text-dark mb-0"
                                  style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.82rem', color: '#475569' }}
                                >
                                  {op}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTROLS FOOTER */}
        <div className="d-flex justify-content-end p-4 bg-light border-top" style={{ borderColor: '#f1f0f9' }}>
          <button
            className="btn px-5 py-2.5 rounded-3 fw-bold shadow-sm border-0 hover-btn-lux text-white"
            onClick={handleSave}
            disabled={saving}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving Policies...
              </>
            ) : (
              <span className="d-flex align-items-center justify-content-center">
                {THIN_ICONS.lock} Save Role Configurations
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;