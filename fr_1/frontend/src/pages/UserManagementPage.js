// src/pages/UserManagementPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/adminService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Administration',
    phone: ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadUsers = async () => {
    try {
      const u = await fetchUsers();
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      setUsers([]);
      showToast(false, 'Unable to load users from backend. Please check your server connection.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (success, message) => {
    if (success) {
      setSuccessMsg(message);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(message);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'Employee', department: user.department || 'Administration', phone: user.phone || '' });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'Employee', department: 'Administration', phone: '' });
    }
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const submissionPayload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      department: userForm.department.trim() || 'Administration',
      phone: userForm.phone.trim() || ''
    };

    if (!editingUser) {
      submissionPayload.password = userForm.password;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, submissionPayload);
        showToast(true, 'User account details updated successfully!');
      } else {
        await createUser(submissionPayload);
        showToast(true, 'New user profile registered smoothly!');
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      setShowUserModal(false);
      showToast(false, err.response?.data?.message || err.message || 'Unable to save user profile. Please try again.');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete user account "${email}"?`)) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!u || !u.name) return false;
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  return (
    // 🟢 ENHANCED LIGHT MODE WRAPPER CONTAINER CANVAS
    <div className="theme-admin container-fluid px-4 py-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>

      {/* 🟢 RE-ENGINEERED LIGHT MODE UI STRUCTURAL ACCENTS */}
      <style>{`
        .custom-terminal-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04) !important;
          overflow: hidden !important;
        }
        .filter-control-strip {
          background-color: #f1f5f9 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 1.25rem 1.5rem !important;
        }
        .lux-interactive-input {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #1e293b !important;
          font-weight: 500 !important;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.15s ease !important;
        }
        .lux-interactive-input:hover {
          border-color: #2563eb !important;
        }
        .lux-interactive-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
          color: #1e293b !important;
          outline: none;
        }
        .premium-action-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          border: none !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease !important;
        }
        .premium-action-btn:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
          filter: brightness(1.05) !important;
          color: #ffffff !important;
        }
        .premium-action-btn:active {
          transform: translateY(0) !important;
        }
        .lux-data-row {
          transition: background-color 0.12s ease !important;
        }
        .lux-data-row:hover {
          background-color: #f8fafc !important;
        }
        .row-operation-btn {
          font-weight: 600 !important;
          padding: 6px 12px !important;
          border-radius: 8px !important;
          transition: all 0.15s ease-in-out !important;
        }
        .row-operation-btn:hover {
          transform: translateY(-1px) !important;
        }
        .light-table-header th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 700 !important;
          font-size: 0.8rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }
      `}</style>

      {/* Toast Feedbacks */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-4 shadow border-0 position-fixed top-0 end-0 m-4 z-3" style={{ maxWidth: '400px', backgroundColor: '#ffffff', border: '1px solid #10b981', color: '#065f46' }}>
          <div><span className="me-2">✔️</span><strong>Database Sync:</strong> {successMsg}</div>
          <button className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-4 shadow border-0 position-fixed top-0 end-0 m-4 z-3" style={{ maxWidth: '400px', backgroundColor: '#ffffff', border: '1px solid #ef4444', color: '#991b1b' }}>
          <div><span className="me-2">⚠️</span><strong>Error Log:</strong> {errorMsg}</div>
          <button className="btn-close" onClick={() => setErrorMsg('')}></button>
        </div>
      )}

      {/* Roster Descriptive Header Strip */}
      <div className="mb-4 pb-2 border-bottom" style={{ borderColor: '#e2e8f0' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>👥</span>
          <h3 className="fw-bold mb-0" style={{ color: '#1e293b' }}>User Management Terminal</h3>
        </div>
        <p className="text-muted mb-0">Manage platform operational credentials and synchronize organizational departments.</p>
      </div>

      {/* Main Table Interface Grid Card */}
      <div className="card border-0 custom-terminal-card">

        {/* CONTROLS MATRIX BAR SECTION */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 filter-control-strip">
          <div className="d-flex flex-grow-1 gap-3" style={{ maxWidth: '650px' }}>
            <div className="position-relative flex-grow-1">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 10 }}>🔍</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 lux-interactive-input small py-2"
                placeholder="Search users by name, email, department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select rounded-pill lux-interactive-input px-4 py-2"
              style={{ width: '170px', cursor: 'pointer' }}
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Sales">Sales</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <button className="btn rounded-pill px-4 py-2 premium-action-btn shadow-sm" onClick={() => handleOpenUserModal()}>
            + Register New User
          </button>
        </div>

        {/* User Inventory Data Grid Ledger */}
        <div className="table-responsive p-3">
          <table className="table align-middle mb-0">
            <thead className="light-table-header">
              <tr>
                <th className="py-3 ps-3">Full Name</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">System Role</th>
                <th className="py-3">Department</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Joined</th>
                <th className="text-end pe-4 py-3">Workspace Operations</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="lux-data-row">
                  <td className="py-3.5 ps-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                        {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <span className="fw-semibold" style={{ color: '#1e293b' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="text-secondary font-monospace" style={{ fontSize: '0.88rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge px-3 py-1.5 rounded-pill border fw-semibold ${u.role === 'Admin' ? 'bg-danger-subtle text-danger' :
                        u.role === 'HR' ? 'bg-success-subtle text-success' :
                          u.role === 'Manager' ? 'bg-primary-subtle text-primary' :
                            u.role === 'Sales' ? 'bg-warning-subtle text-warning-emphasis' :
                              'bg-secondary-subtle text-secondary'
                      }`} style={{ fontSize: '0.74rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-secondary fw-medium">{u.department || '—'}</td>
                  <td className="text-secondary font-monospace small">{u.phone || '—'}</td>
                  <td className="text-muted small">{new Date(u.created_at || new Date()).toLocaleDateString()}</td>
                  <td className="text-end pe-3 text-nowrap">
                    <button className="btn btn-sm btn-outline-primary border row-operation-btn bg-white me-2" onClick={() => handleOpenUserModal(u)}>✏️ Edit</button>
                    <button className="btn btn-sm btn-outline-danger border row-operation-btn bg-white" onClick={() => handleDeleteUser(u.id, u.email)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Lightbox Content Portal Container */}
        {showUserModal && (
          <div className="crm-modal-backdrop" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered style-modal-box w-100" style={{ maxWidth: '520px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4" style={{ backgroundColor: '#ffffff' }}>
                <div className="modal-header border-0 pb-2 pt-0 px-0 d-flex justify-content-between align-items-center">
                  <h5 className="modal-title fw-bold text-dark">{editingUser ? '✏️ Modify User Account' : '➕ Register User Account'}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowUserModal(false)}></button>
                </div>
                <form onSubmit={handleUserSubmit}>
                  <div className="modal-body px-0 py-3">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-bold text-secondary mb-1">Full Name *</label>
                        <input type="text" name="name" className="form-control rounded-3 lux-interactive-input" required value={userForm.name} onChange={handleFormInputChange} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-secondary mb-1">Email Address *</label>
                        <input type="email" name="email" className="form-control rounded-3 lux-interactive-input" required value={userForm.email} onChange={handleFormInputChange} />
                      </div>
                      {!editingUser && (
                        <div className="col-12">
                          <label className="form-label small fw-bold text-secondary mb-1">Password *</label>
                          <input type="password" name="password" className="form-control rounded-3 lux-interactive-input" required value={userForm.password} onChange={handleFormInputChange} />
                        </div>
                      )}
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary mb-1">System Role</label>
                        <select name="role" className="form-select rounded-3 lux-interactive-input" value={userForm.role} onChange={handleFormInputChange} style={{ cursor: 'pointer' }}>
                          <option value="Admin">Admin</option>
                          <option value="HR">HR</option>
                          <option value="Manager">Manager</option>
                          <option value="Sales">Sales</option>
                          <option value="Employee">Employee</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary mb-1">Department</label>
                        <input type="text" name="department" className="form-control rounded-3 lux-interactive-input" value={userForm.department} onChange={handleFormInputChange} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-secondary mb-1">Phone Number</label>
                        <input type="text" name="phone" className="form-control rounded-3 lux-interactive-input" value={userForm.phone} onChange={handleFormInputChange} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-3 pb-0 px-0 gap-2 d-flex justify-content-end">
                    <button type="button" className="btn btn-light border rounded-3 px-4" onClick={() => setShowUserModal(false)}>Cancel</button>
                    <button type="submit" className="btn rounded-3 px-4 premium-action-btn shadow-sm">Save Profile</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;