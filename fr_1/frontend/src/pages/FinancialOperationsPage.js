// src/pages/FinancialOperationsPage.js
import React, { useMemo, useState } from 'react';
import { getCurrentUser } from '../utils/authHelpers';

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
  rupee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M6 3h12" />
      <path vectorEffect="non-scaling-stroke" d="M6 8h12" />
      <path vectorEffect="non-scaling-stroke" d="M9 13c6.667 0 6.667-10 0-10" />
      <path vectorEffect="non-scaling-stroke" d="M6 13h3" />
      <path vectorEffect="non-scaling-stroke" d="m6 13 8.5 8" />
    </svg>
  ),
  card: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  pieChart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path vectorEffect="non-scaling-stroke" d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
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

const FinancialOperationsPage = () => {
  const user = getCurrentUser();
  const canManage = ['Admin', 'Manager', 'Finance'].includes(user?.role);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const defaultLedger = [
    { id: 'TX-401', desc: 'Raw Material PO Bulk Order', type: 'Expense', amount: 130000, date: '01 Jun 2026', category: 'Procurement', status: 'Settled' },
    { id: 'TX-402', desc: 'Client Payment - Apex Const.', type: 'Revenue', amount: 43000, date: '28 May 2026', category: 'Sales', status: 'Cleared' },
    { id: 'TX-403', desc: 'Staff Payroll Disbursement', type: 'Expense', amount: 185000, date: '25 May 2026', category: 'Payroll', status: 'Completed' },
    { id: 'TX-404', desc: 'Vendor Overdue Invoice #892', type: 'Payable', amount: 68000, date: '18 May 2026', category: 'Vendor Pay', status: 'Overdue' }
  ];

  const [ledger, setLedger] = useState(defaultLedger);
  const [txForm, setTxForm] = useState({ desc: '', type: 'Revenue', amount: 25000, category: 'Sales', status: 'Cleared' });

  const metrics = useMemo(() => {
    return {
      revenue: '₹0.4L',
      payables: '₹1.3L',
      overdue: '₹68K',
      receivables: '₹310K'
    };
  }, []);

  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch = item.desc.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchType = selectedType === 'All' || item.type === selectedType;
      return matchSearch && matchType;
    });
  }, [ledger, searchTerm, selectedType]);

  const handleAddTx = (e) => {
    e.preventDefault();
    const newTx = {
      id: `TX-${Date.now().toString().slice(-3)}`,
      ...txForm,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setLedger([newTx, ...ledger]);
    alert('Financial transaction logged!');
    setShowModal(false);
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

  return (
    <div className="theme-finance container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW FINANCE TABLE */
        .theme-finance table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-finance th {
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
        .theme-finance td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-finance tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-finance tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-finance tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-finance tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.card}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Financial Operations
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>FINANCE</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage budgets, expenses, transactions, and financial performance.</p>
          </div>
        </div>
        {canManage && (
          <div className="d-flex align-items-center justify-content-end">
            <button
              className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
              onClick={() => setShowModal(true)}
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
            >
              {THIN_ICONS.plus}
              <span> Log Transaction</span>
            </button>
          </div>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Revenue (Paid)', value: metrics.revenue, sub: '↑ This month', icon: THIN_ICONS.rupee, color: COLORS.emerald },
          { label: 'Total Payables', value: metrics.payables, sub: '↑ 6% vs last month', icon: THIN_ICONS.card, color: COLORS.indigo },
          { label: 'Overdue', value: metrics.overdue, sub: 'Needs attention', icon: THIN_ICONS.alertTriangle, color: COLORS.alert },
          { label: 'Outstanding Recv.', value: metrics.receivables, sub: '↑ 8% vs last month', icon: THIN_ICONS.pieChart, color: COLORS.amber }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* LEDGER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Invoice Register
            </h5>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>Payables & receivables — all invoices</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: '220px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small py-2"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#ffffff', border: '1px solid #e5e0f5' }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              {['All', 'Revenue', 'Expense', 'Payable'].map(type => (
                <button
                  key={type}
                  className={`btn btn-sm rounded-pill px-3 fw-bold ${selectedType === type ? 'text-white' : 'bg-white text-dark'}`}
                  onClick={() => setSelectedType(type)}
                  style={{
                    background: selectedType === type ? `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` : undefined,
                    border: selectedType === type ? '1px solid transparent' : '1px solid #cbd5e1',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-responsive p-4 pt-2">
          <table>
            <thead>
              <tr>
                <th>TX ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map(tx => (
                <tr key={tx.id}>
                  <td className="fw-bold" style={{ color: COLORS.indigo }}>{tx.id}</td>
                  <td className="fw-bold" style={{ color: '#1e293b' }}>{tx.desc}</td>
                  <td><span className="badge rounded-pill bg-light text-primary px-3">{tx.category}</span></td>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${tx.type === 'Revenue' ? 'bg-success-subtle text-success' : tx.type === 'Expense' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="fw-bold">₹{tx.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${tx.status === 'Overdue' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                      • {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">Log Financial Transaction</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddTx}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <input type="text" className="form-control rounded-3" value={txForm.desc} onChange={(e) => setTxForm({ ...txForm, desc: e.target.value })} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Transaction Type</label>
                      <select className="form-select rounded-3" value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                        <option value="Payable">Payable</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Category</label>
                      <select className="form-select rounded-3" value={txForm.category} onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}>
                        <option value="Sales">Sales</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Payroll">Payroll</option>
                        <option value="Vendor Pay">Vendor Pay</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Amount (₹)</label>
                    <input type="number" className="form-control rounded-3" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button type="submit" className="btn rounded-3 px-4 py-2 border-0 text-white fw-bold hover-btn-lux" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)`, flex: 1 }}>
                    Save Transaction
                  </button>
                  <button type="button" className="btn rounded-3 px-4 py-2 bg-light border fw-bold text-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
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

export default FinancialOperationsPage;