// src/pages/RolesPermissionsPage.js
import React, { useState } from 'react';

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
    // 🟢 ENHANCED LIGHT MODE BACKGROUND MATRIX WRAPPER
    <div className="theme-admin container-fluid px-4 py-3" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>

      {/* 🟢 RE-ENGINEERED SCALED LIGHT MODE MICROSURFACE ACCENTS & CHECKBOX VISIBILITY FIXES */}
      <style>{`
        .premium-card-lux {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 18px !important;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04) !important;
        }
        .matrix-table {
          border: 1px solid #cbd5e1 !important;
        }
        .matrix-table th {
          background-color: #f1f5f9 !important;
          color: #334155 !important;
          font-weight: 700 !important;
          border: 1px solid #cbd5e1 !important;
          padding: 12px !important;
        }
        .matrix-table td {
          border: 1px solid #e2e8f0 !important;
          padding: 10px !important;
          background-color: #ffffff !important;
        }
        .perm-group-box {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px;
          transition: all 0.15s ease-in-out;
        }
        .perm-group-box:hover {
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        
        /* 🟢 VISIBILITY OVERRIDE: GUARANTEES PURE BLACK CHECKMARK OVER WHITE BACKGROUND */
        .form-check-input {
          cursor: pointer;
          border: 2px solid #64748b !important; /* Thickened Slate Gray target border line */
          background-color: #ffffff !important;
          width: 17px;
          height: 17px;
          transition: all 0.1s ease-in-out;
        }
        .form-check-input:checked {
          background-color: #2563eb !important; /* Royal Blue Fill background on selection */
          border-color: #1d4ed8 !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M5 10l3 3l7-7'/%3e%3c/svg%3e") !important;
        }
        .btn-save-lux {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: white !important;
          border: none !important;
          transition: all 0.2s ease !important;
        }
        .btn-save-lux:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
          filter: brightness(1.05);
        }
      `}</style>

      {/* Toast Alert */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-4 shadow border-0 position-fixed top-0 end-0 m-4 z-3" style={{ maxWidth: '400px', backgroundColor: '#ffffff', border: '1px solid #10b981', color: '#065f46' }}>
          <div><span className="me-2">✅</span><strong>Success:</strong> {successMsg}</div>
          <button className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {/* Header Panel */}
      <div className="mb-4 pb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">🔐</span>
          <h3 className="fw-bold text-dark mb-0">Roles & Permissions Matrix</h3>
        </div>
        <p className="text-muted mb-0">Configure operational module restrictions and role privileges across the enterprise system.</p>
      </div>

      {/* MAIN CONTAINER SURFACE */}
      <div className="card border-0 premium-card-lux p-4">
        <div className="alert border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3" style={{ backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fef3c7' }}>
          <span className="fs-4">⚠️</span>
          <div>
            <h6 className="fw-bold mb-1">Administrative Warning Alert</h6>
            <p className="mb-0 small" style={{ color: '#b45309' }}>Modifying these parameters alters granular route gateways. Changing permissions does not impact active session cookies until next worker re-authentication cycle.</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle text-center matrix-table mb-0">
            <thead>
              <tr>
                <th className="text-start" style={{ width: '260px' }}>System Module Directory</th>
                {Object.keys(permissions).map(role => (
                  <th key={role} style={{ minWidth: '150px' }}>
                    <span className={`badge px-3 py-1.5 rounded-pill ${role === 'Admin' ? 'bg-danger text-white' :
                        role === 'HR' ? 'bg-success text-white' :
                          role === 'Manager' ? 'bg-primary text-white' :
                            role === 'Sales' ? 'bg-info text-white' :
                              'bg-secondary text-white'
                      }`}>
                      {role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.key}>
                  <td className="text-start fw-bold text-dark">{mod.label}</td>
                  {Object.keys(permissions).map(role => {
                    const roleModPerms = permissions[role][mod.key] || [];
                    return (
                      <td key={role}>
                        {/* Box layout for nested selections */}
                        <div className="d-flex flex-column gap-2 text-start p-2 perm-group-box">
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
                                  className="form-check-label small fw-semibold text-dark mb-0"
                                  style={{ cursor: 'pointer', userSelect: 'none' }}
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

        {/* Action controls footer */}
        <div className="d-flex justify-content-end mt-4 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
          <button className="btn btn-save-lux rounded-pill px-5 py-2.5 fw-semibold shadow" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            ) : '🔒 Save Role Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;