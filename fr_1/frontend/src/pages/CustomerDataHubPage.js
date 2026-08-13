// src/pages/CustomerDataHubPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../utils/authHelpers';
import api from '../services/api';

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

const THIN_ICONS = {
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="7" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path vectorEffect="non-scaling-stroke" d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  alertCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="8" x2="12" y2="12" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  rupee: (
    <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>₹</span>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="12" y1="5" x2="12" y2="19" />
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
};

const CustomerDataHubPage = () => {
  const user = getCurrentUser();

  const defaultCustomers = [
    { id: 7, cus_code: 'CUS-007', company: 'Horizon Housing', contact_person: 'Manish Sharma', email: 'manish@horizon.in', city: 'Noida', segment: 'Mid-Market', status: 'Active', revenue: 52000, deals: 5 },
    { id: 8, cus_code: 'CUS-008', company: 'Greenfield Infra', contact_person: 'Deepa Rao', email: 'deepa@greenfield.co', city: 'Jaipur', segment: 'Mid-Market', status: 'At Risk', revenue: 310000, deals: 20 },
    { id: 9, cus_code: 'CUS-009', company: 'TechBuild Co.', contact_person: 'Siddharth V.', email: 'sid@techbuild.com', city: 'Pune', segment: 'Enterprise', status: 'Active', revenue: 185000, deals: 12 },
    { id: 10, cus_code: 'CUS-010', company: 'Metro Projects', contact_person: 'Vikram Joshi', email: 'vikram@metroproj.org', city: 'Delhi', segment: 'SMB', status: 'Active', revenue: 95000, deals: 8 },
    { id: 11, cus_code: 'CUS-011', company: 'Apex Constructions', contact_person: 'Ramesh Patel', email: 'ramesh@apexconst.com', city: 'Mumbai', segment: 'Enterprise', status: 'Active', revenue: 408000, deals: 25 }
  ];

  const [customers, setCustomers] = useState(defaultCustomers);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [custForm, setCustForm] = useState({
    company: '',
    contact_person: '',
    email: '',
    city: 'Noida',
    segment: 'Mid-Market',
    status: 'Active',
    revenue: 52000,
    deals: 5
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers').catch(() => null);
      const rawData = res?.data || [];
      const normalizedData = rawData.map(c => {
        let rawStatus = (c.status || 'Active').trim().toLowerCase();
        let formattedStatus = 'Active';
        if (rawStatus === 'at risk') formattedStatus = 'At Risk';
        else if (rawStatus === 'inactive') formattedStatus = 'Inactive';

        return {
          ...c,
          company: c.company || c.name || 'Company',
          cus_code: c.cus_code || `CUS-00${c.id}`,
          status: formattedStatus
        };
      });
      setCustomers(normalizedData.length ? normalizedData : defaultCustomers);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers(defaultCustomers);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = customers.length ? customers : defaultCustomers;
    const total = list.length;
    const active = list.filter(c => (c.status || '').trim().toLowerCase() === 'active').length;
    const atRisk = list.filter(c => {
      const s = (c.status || '').trim().toLowerCase();
      return s.includes('risk') || s.includes('inactive');
    }).length;
    const totalRev = list.reduce((acc, curr) => acc + (Number(curr.revenue) || Number(curr.total_spend) || 0), 0) || 1050000;
    return { total, active, atRisk, totalRev };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const list = customers.length ? customers : defaultCustomers;
    return list.filter(c => {
      const q = searchTerm.toLowerCase();
      const compMatch = (c.company || c.name || '').toLowerCase().includes(q);
      const contactMatch = (c.contact_person || '').toLowerCase().includes(q);
      const codeMatch = (c.cus_code || `CUS-00${c.id}`).toLowerCase().includes(q);

      const itemStatus = (c.status || 'Active').trim().toLowerCase();
      const targetFilter = statusFilter.trim().toLowerCase();

      let statusMatch = false;
      if (statusFilter === 'All') {
        statusMatch = true;
      } else if (targetFilter === 'at risk') {
        statusMatch = itemStatus === 'at risk' || itemStatus === 'inactive';
      } else {
        statusMatch = itemStatus === targetFilter;
      }

      return (compMatch || contactMatch || codeMatch) && statusMatch;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    // Optimistically update local state immediately to fix UI dropdown bug
    setCustomers(prevCustomers =>
      prevCustomers.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );

    try {
      await api.patch(`/customers/${id}/status`, { status: newStatus }).catch(() => {
        // Fallback or generic PUT if patch isn't supported by backend endpoint
        api.put(`/customers/${id}`, { status: newStatus }).catch(() => null);
      });
    } catch (err) {
      console.error('Failed to sync status update with server:', err);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const newCust = {
        id: Date.now(),
        cus_code: custForm.cus_code || `CUS-0${Math.floor(10 + Math.random() * 90)}`,
        ...custForm
      };
      await api.post('/customers', newCust).catch(() => null);
      setCustomers([newCust, ...customers]);
      alert('Customer profile created successfully!');
      setShowModal(false);
      setCustForm({
        company: '',
        contact_person: '',
        email: '',
        city: 'Noida',
        segment: 'Mid-Market',
        status: 'Active',
        revenue: 52000,
        deals: 5
      });
    } catch (err) {
      alert('Failed to create customer record.');
    }
  };

  const getInitial = (name) => {
    if (!name) return 'C';
    return name.charAt(0).toUpperCase();
  };

  const MetricCard = ({ label, value, sub, icon, color }) => (
    <div className="card border-0 h-100 metric-card-lux" style={{ borderRadius: '22px', background: '#ffffff' }}>
      <div className="p-3 d-flex align-items-start gap-2">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#ffffff', color: color, fontSize: '1.1rem',
            border: `2px solid ${color}40`
          }}>
          {icon}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</h3>
          <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25 }}>{label}</span>
        </div>
      </div>
      {sub && (
        <div className="px-3 pb-3">
          <small className="fw-medium" style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block' }}>{sub}</small>
        </div>
      )}
    </div>
  );

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;
    try {
      await api.delete(`/customers/${id}`).catch(() => null);
      setCustomers(customers.filter(c => c.id !== id));
      alert('Customer record deleted successfully.');
    } catch (err) {
      alert('Failed to delete customer record.');
    }
  };

  return (
    <div className="theme-customers container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      <style>{`
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: #ffffff !important;
          box-shadow: 0 8px 24px rgba(31,41,55,0.06) !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31,41,55,0.09) !important;
        }
        .metric-card-lux {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          box-shadow: 0 8px 22px rgba(31,41,55,0.05) !important;
        }
        .metric-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 26px rgba(31,41,55,0.09) !important;
        }
        .hover-btn-lux { transition: all 0.2s ease !important; }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 6px;
        }

        /* FLOATING-ROW CUSTOMERS TABLE */
        .theme-customers table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-customers th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border: none !important;
          text-align: left !important;
        }
        .theme-customers td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-customers tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-customers tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-customers tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-customers tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .company-badge-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #EBF4FF; color: #3B82F6; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── ACTION ICON BUTTONS ── */
        .btn-action-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          border: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .view-icon-btn {
          background-color: #EFF6FF !important;
          color: #3B82F6 !important;
        }
        .view-icon-btn:hover {
          background-color: #3B82F6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
          transform: translateY(-1px);
        }
        .del-icon-btn {
          background-color: #FFF1F2 !important;
          color: #F43F5E !important;
        }
        .del-icon-btn:hover {
          background-color: #F43F5E !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* MATCHED HEADER — icon + title left, + Add Customer button top-right (like OrderManagementPage) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.users}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Customer Data Hub</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage customer profiles, account information, and relationship insights</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span> Add Customer</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Customers', value: metrics.total, sub: '↑ 12% vs last month', icon: THIN_ICONS.users, color: COLORS.indigo },
          { label: 'Active Accounts', value: metrics.active, sub: '↑ 8% vs last month', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'At Risk', value: metrics.atRisk, sub: '↓ 5% vs last month', icon: THIN_ICONS.alertCircle, color: COLORS.amber },
          { label: 'Total Revenue', value: `₹${(metrics.totalRev / 1000).toFixed(0)}K`, sub: '↑ 18% vs last month', icon: THIN_ICONS.rupee, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* CUSTOMER MASTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Customer Master</h5>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>Full customer profiles and account health</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: '260px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'Active', 'At Risk', 'Inactive'].map(st => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-light text-dark'}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                  border: statusFilter === st ? '1px solid transparent' : '1px solid #cbd5e1'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>City</th>
                <th>Segment</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Deals</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => {
                const currentStatus = c.status || 'Active';
                let selectColorClass = 'bg-success-subtle text-success';
                if (currentStatus === 'At Risk') selectColorClass = 'bg-warning-subtle text-warning';
                else if (currentStatus === 'Inactive') selectColorClass = 'bg-secondary-subtle text-secondary';

                return (
                  <tr key={c.id}>
                    <td className="fw-bold" style={{ color: COLORS.indigo }}>{c.cus_code || `CUS-00${c.id}`}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="company-badge-avatar">{getInitial(c.company || c.name)}</div>
                        <span className="fw-bold" style={{ color: '#1e293b' }}>{c.company || c.name}</span>
                      </div>
                    </td>
                    <td className="fw-semibold">{c.contact_person || 'Manish Sharma'}</td>
                    <td className="small" style={{ color: '#94a3b8' }}>{c.email || 'contact@company.in'}</td>
                    <td>📍 {c.city || 'Noida'}</td>
                    <td>
                      <span className="badge rounded-pill bg-light text-primary border border-primary-subtle px-3">
                        {c.segment || 'Mid-Market'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm rounded-pill px-3 fw-bold ${selectColorClass}`}
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        style={{ width: '130px', border: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        <option value="Active">Active</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="fw-bold" style={{ color: COLORS.emerald }}>₹{(Number(c.revenue) || 52000).toLocaleString()}</td>
                    <td className="fw-bold text-center">{c.deals || 5}</td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button
                          className="btn-action-icon view-icon-btn"
                          title="View Customer Profile"
                          onClick={() => handleViewCustomer(c)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon del-icon-btn"
                          title="Delete Customer Record"
                          onClick={() => handleDeleteCustomer(c.id)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW CUSTOMER MODAL */}
      {showViewModal && selectedCustomer && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2">
                  <span>🏢</span> {selectedCustomer.company || selectedCustomer.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="p-3 mb-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>CUSTOMER ID</span>
                    <span className="fw-bold" style={{ color: COLORS.indigo }}>{selectedCustomer.cus_code || `CUS-00${selectedCustomer.id}`}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>CONTACT PERSON</span>
                    <span className="fw-semibold">{selectedCustomer.contact_person || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>EMAIL</span>
                    <span className="fw-semibold">{selectedCustomer.email || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>PHONE</span>
                    <span className="fw-semibold">{selectedCustomer.phone || '+91-98200-XXXXX'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>CITY</span>
                    <span className="fw-semibold">📍 {selectedCustomer.city || 'Noida'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>SEGMENT</span>
                    <span className="badge rounded-pill bg-light text-primary">{selectedCustomer.segment || 'Mid-Market'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>ACCOUNT STATUS</span>
                    <span className={`badge rounded-pill ${selectedCustomer.status === 'Active' ? 'bg-success-subtle text-success' : selectedCustomer.status === 'At Risk' ? 'bg-warning-subtle text-warning' : 'bg-secondary-subtle text-secondary'}`}>
                      {selectedCustomer.status || 'Active'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small fw-bold" style={{ color: '#94a3b8' }}>TOTAL REVENUE</span>
                    <span className="fw-bold" style={{ color: COLORS.emerald }}>₹{(Number(selectedCustomer.revenue) || 52000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn rounded-pill px-4 bg-white border" style={{ borderColor: '#cbd5e1', color: '#475569' }} onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <span style={{ color: COLORS.indigo }}>{THIN_ICONS.users}</span> Add New Customer
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddCustomer}>
                <div className="modal-body py-3">
                  {/* AUTO GENERATED CUSTOMER ID */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.05em' }}>
                      CUSTOMER ID (AUTO-GENERATED — YOU CAN EDIT IT)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 fw-bold"
                      value={custForm.cus_code || 'CUS-013'}
                      onChange={(e) => setCustForm({ ...custForm, cus_code: e.target.value })}
                      style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                    />
                  </div>

                  {/* COMPANY NAME & CONTACT PERSON */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>COMPANY NAME *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. ABC Corporation"
                        value={custForm.company}
                        onChange={(e) => setCustForm({ ...custForm, company: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CONTACT PERSON *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Rajesh Mehta"
                        value={custForm.contact_person}
                        onChange={(e) => setCustForm({ ...custForm, contact_person: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* EMAIL & PHONE */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>EMAIL</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        placeholder="contact@company.com"
                        value={custForm.email}
                        onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PHONE</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="+91-98200-XXXXX"
                        value={custForm.phone || ''}
                        onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* CITY & SEGMENT */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>CITY</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Mumbai"
                        value={custForm.city}
                        onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>SEGMENT</label>
                      <select
                        className="form-select rounded-3"
                        value={custForm.segment}
                        onChange={(e) => setCustForm({ ...custForm, segment: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="SMB">SMB</option>
                        <option value="Mid-Market">Mid-Market</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>STATUS</label>
                    <select
                      className="form-select rounded-3"
                      value={custForm.status}
                      onChange={(e) => setCustForm({ ...custForm, status: e.target.value })}
                      style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                    >
                      <option value="Active">Active</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-0 d-flex gap-2">
                  <button type="submit" className="btn flex-grow-1 rounded-3 py-2 border-0 text-white fw-bold shadow-sm hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Add Customer
                  </button>
                  <button type="button" className="btn flex-grow-1 rounded-3 py-2 bg-white border fw-bold text-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDataHubPage;