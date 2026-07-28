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
    { key: 'materials', label: '📦 Materials Tracking', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'hrms', label: '👥 HRMS Employee Directory', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'payroll', label: '💰 Payroll & Financials', ops: ['Read', 'Create', 'Edit', 'Delete'] },
    { key: 'logs', label: '📋 System Audit Logs', ops: ['Read', 'Export'] },
    { key: 'backups', label: '💾 Database Backups', ops: ['Create', 'Restore'] },
    { key: 'integrations', label: '🔌 Webhook Integrations', ops: ['Toggle', 'Test'] }
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
          <div className="d-flex align-items-center gap-2">
            <span>✨</span> <small className="fw-bold">{successMsg}</small>
          </div>
          <button className="btn-close btn-close-white" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* ADMINISTRATIVE SECURITY WARNING */}
      <div className="alert border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3 shadow-sm" style={{ backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fef3c7', borderRadius: '22px' }}>
        <span className="fs-4">⚠️</span>
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
                  <td className="text-start fw-bold text-dark ps-4" style={{ fontSize: '0.92rem' }}>{mod.label}</td>
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
            ) : '🔒 Save Role Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;