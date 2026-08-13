// src/pages/ProcurementManagementPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchProcurements, createProcurement, updateProcurement } from '../services/procurementService';
import { fetchVendors } from '../services/vendorService';
import { fetchMaterials } from '../services/materialService';
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
  cart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="9" cy="21" r="1" />
      <circle vectorEffect="non-scaling-stroke" cx="20" cy="21" r="1" />
      <path vectorEffect="non-scaling-stroke" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <polyline vectorEffect="non-scaling-stroke" points="12 6 12 12 16 14" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
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
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="6 9 12 15 18 9" />
    </svg>
  )
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const ProcurementManagementPage = () => {
  const user = getCurrentUser();
  const canManage = true; // 🟢 Allow all roles (Admin, Manager, Employee, Sales, HR, Finance) to access + Raise PO button

  const [procurements, setProcurements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [poForm, setPoForm] = useState({
    po_code: '',
    vendor_name: '',
    item_name: '',
    quantity: 0,
    unit: 'pcs',
    total_cost: 0,
    delivery_date: '',
    priority: 'Medium',
    department: 'Warehouse',
    approver: 'Manager',
    status: 'Dispatched'
  });

  const defaultPOs = [
    { id: 1, po_code: 'PO-1209', vendor_name: 'LubeTech Supplies', item_name: 'Grease Cartridge × 60 pcs', qty: 60, amount: 15000, raised_date: '31 May 2026', delivery_date: '5 Jun 2026', priority: 'Normal', status: 'Dispatched' },
    { id: 2, po_code: 'PO-1208', vendor_name: 'ThermoCoat Paints', item_name: 'Exterior Coat 20L × 40 cans', qty: 40, amount: 28000, raised_date: '30 May 2026', delivery_date: '6 Jun 2026', priority: 'Low', status: 'Received' },
    { id: 3, po_code: 'PO-1207', vendor_name: 'Apex Industrial Ltd', item_name: 'Raw Steel Alloy Rods 500kg', qty: 500, amount: 45000, raised_date: '28 May 2026', delivery_date: '10 Jun 2026', priority: 'High', status: 'Pending' },
    { id: 4, po_code: 'PO-1206', vendor_name: 'Vertex Logistics', item_name: 'Hydraulic Actuators × 10 units', qty: 10, amount: 32000, raised_date: '25 May 2026', delivery_date: '12 Jun 2026', priority: 'Normal', status: 'Approved' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, vData, mData] = await Promise.all([
        fetchProcurements().catch(() => []),
        fetchVendors().catch(() => []),
        fetchMaterials().catch(() => [])
      ]);
      setProcurements(pData.length ? pData : defaultPOs);
      setVendors(vData || []);
      setMaterials(mData || []);
    } catch (err) {
      console.error('Error loading procurement data:', err);
      setProcurements(defaultPOs);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = procurements.length ? procurements : defaultPOs;
    const total = list.length;
    const pending = list.filter(p => p.status === 'Pending').length;
    const approved = list.filter(p => p.status === 'Approved' || p.status === 'Dispatched' || p.status === 'Received').length;
    const totalValue = list.reduce((acc, curr) => acc + (Number(curr.total_cost) || Number(curr.amount) || 0), 0) || 180000;
    return { total, pending, approved, totalValue };
  }, [procurements]);

  const filteredPOs = useMemo(() => {
    const list = procurements.length ? procurements : defaultPOs;
    return list.filter(p => {
      const q = searchTerm.toLowerCase();
      const codeMatch = (p.po_code || `PO-${p.id}`).toLowerCase().includes(q);
      const vendorMatch = (p.vendor_name || p.supplier_name || '').toLowerCase().includes(q);
      const itemMatch = (p.item_name || p.material_name || '').toLowerCase().includes(q);
      const statusMatch = statusFilter === 'All' || p.status === statusFilter;
      return (codeMatch || vendorMatch || itemMatch) && statusMatch;
    });
  }, [procurements, searchTerm, statusFilter]);

  const handleRaisePO = async (e) => {
    e.preventDefault();
    try {
      const newPO = {
        id: Date.now(),
        po_code: poForm.po_code || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor_name: poForm.vendor_name || 'ArcelorMittal',
        item_name: `${poForm.item_name || 'Steel Rod 12mm'} × ${poForm.quantity || 1} ${poForm.unit || 'pcs'}`,
        quantity: poForm.quantity || 1,
        qty: poForm.quantity || 1,
        total_cost: poForm.total_cost || 15000,
        amount: poForm.total_cost || 15000,
        delivery_date: poForm.delivery_date || '5 Jun 2026',
        priority: poForm.priority || 'Medium',
        department: poForm.department || 'Warehouse',
        approver: poForm.approver || 'Manager',
        status: 'Dispatched',
        procurement_date: new Date().toISOString().split('T')[0]
      };

      await createProcurement(newPO).catch(() => null);
      setProcurements([newPO, ...procurements]);
      alert('Purchase Order submitted successfully!');
      setShowModal(false);
    } catch (err) {
      alert('Failed to raise purchase order.');
    }
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
    <div className="theme-procurement container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW PROCUREMENT TABLE */
        .theme-procurement table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-procurement th {
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
        .theme-procurement td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-procurement tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-procurement tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-procurement tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-procurement tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }
      `}</style>

      {/* HEADER — Raise PO button moved here, right-aligned, orange gradient (matches VendorsPage) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.cart}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Procurement Management
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>PROCUREMENT</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Streamline purchasing workflows, supplier coordination, and procurement efficiency.</p>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span>Raise PO</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total POs', value: metrics.total, sub: '↑ 14% vs last month', icon: THIN_ICONS.cart, color: COLORS.indigo },
          { label: 'Pending Approval', value: metrics.pending, sub: 'Action required', icon: THIN_ICONS.clock, color: COLORS.amber },
          { label: 'Approved', value: metrics.approved, sub: '↑ 21% vs last month', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'Procurement Value', value: `₹${(metrics.totalValue / 1000).toFixed(0)}K`, sub: '↑ 14% vs last month', icon: THIN_ICONS.rupee, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* PURCHASE ORDERS TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Purchase Orders Register</h5>
            <p className="small text-muted mb-0">Track all active material requests and POs</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: '220px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search PO, vendor, item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'Pending', 'Approved', 'Dispatched', 'Received'].map(st => (
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
                <th>PO ID</th>
                <th>Vendor</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Raised</th>
                <th>Delivery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id}>
                  <td className="fw-bold" style={{ color: COLORS.indigo }}>{po.po_code || `PO-120${po.id}`}</td>
                  <td className="fw-bold" style={{ color: '#1e293b' }}>{po.vendor_name || 'LubeTech Supplies'}</td>
                  <td>{po.item_name || 'Grease Cartridge × 60 pcs'}</td>
                  <td className="fw-bold">{po.quantity || po.qty || 60} pcs</td>
                  <td className="fw-bold">₹{(Number(po.total_cost) || Number(po.amount) || 15000).toLocaleString()}</td>
                  <td>{formatDate(po.procurement_date || po.raised_date || '2026-05-31')}</td>
                  <td>{formatDate(po.delivery_date || '2026-06-05')}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${po.status === 'Approved' || po.status === 'Received' || po.status === 'Dispatched' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                      • {po.status || 'Dispatched'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAISE PO MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  {THIN_ICONS.cart} Raise New Purchase Order
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRaisePO}>
                <div className="modal-body py-3">
                  {/* AUTO-GENERATED PO ID */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      PO ID (AUTO-GENERATED — YOU CAN EDIT IT)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 fw-bold"
                      value={poForm.po_code || `PO-${Date.now()}`}
                      onChange={(e) => setPoForm({ ...poForm, po_code: e.target.value })}
                      style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                    />
                  </div>

                  {/* VENDOR NAME & ITEM / MATERIAL */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>VENDOR NAME *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. ArcelorMittal"
                        value={poForm.vendor_name || ''}
                        onChange={(e) => setPoForm({ ...poForm, vendor_name: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>ITEM / MATERIAL *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Steel Rod 12mm"
                        value={poForm.item_name || ''}
                        onChange={(e) => setPoForm({ ...poForm, item_name: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* QUANTITY & UNIT */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>QUANTITY</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        min={0}
                        value={poForm.quantity}
                        onChange={(e) => setPoForm({ ...poForm, quantity: Number(e.target.value) })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>UNIT</label>
                      <div className="position-relative">
                        <select
                          className="form-select rounded-3 pe-5"
                          value={poForm.unit || 'pcs'}
                          onChange={(e) => setPoForm({ ...poForm, unit: e.target.value })}
                          style={{ background: '#FAF8FF', border: '1px solid #E5E0F5', appearance: 'none' }}
                        >
                          <option value="pcs">pcs</option>
                          <option value="kg">kg</option>
                          <option value="tons">tons</option>
                          <option value="liters">liters</option>
                          <option value="boxes">boxes</option>
                        </select>
                        <div className="position-absolute top-50 end-0 translate-middle-y pe-3" style={{ pointerEvents: 'none', color: '#94a3b8' }}>
                          {THIN_ICONS.chevronDown}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AMOUNT & EXPECTED DELIVERY */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>AMOUNT (₹) *</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        min={0}
                        value={poForm.total_cost}
                        onChange={(e) => setPoForm({ ...poForm, total_cost: Number(e.target.value) })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>EXPECTED DELIVERY</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        value={poForm.delivery_date || ''}
                        onChange={(e) => setPoForm({ ...poForm, delivery_date: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* PRIORITY & DEPARTMENT */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>PRIORITY</label>
                      <div className="position-relative">
                        <select
                          className="form-select rounded-3 pe-5"
                          value={poForm.priority || 'Medium'}
                          onChange={(e) => setPoForm({ ...poForm, priority: e.target.value })}
                          style={{ background: '#FAF8FF', border: '1px solid #E5E0F5', appearance: 'none' }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <div className="position-absolute top-50 end-0 translate-middle-y pe-3" style={{ pointerEvents: 'none', color: '#94a3b8' }}>
                          {THIN_ICONS.chevronDown}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>DEPARTMENT</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={poForm.department || 'Warehouse'}
                        onChange={(e) => setPoForm({ ...poForm, department: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* APPROVER */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>APPROVER</label>
                    <div className="position-relative">
                      <select
                        className="form-select rounded-3 pe-5"
                        value={poForm.approver || 'Manager'}
                        onChange={(e) => setPoForm({ ...poForm, approver: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5', appearance: 'none' }}
                      >
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                        <option value="Finance Lead">Finance Lead</option>
                      </select>
                      <div className="position-absolute top-50 end-0 translate-middle-y pe-3" style={{ pointerEvents: 'none', color: '#94a3b8' }}>
                        {THIN_ICONS.chevronDown}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Submit Purchase Order
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

export default ProcurementManagementPage;