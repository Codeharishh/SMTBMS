// src/pages/OrderManagementPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchSalesOrders, createSalesOrder, updateSalesOrderStatus } from '../services/salesService';
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
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline vectorEffect="non-scaling-stroke" points="3.27 6.96 12 12.01 20.73 6.96" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  truck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="1" y="3" width="15" height="13" />
      <polygon vectorEffect="non-scaling-stroke" points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle vectorEffect="non-scaling-stroke" cx="5.5" cy="18.5" r="2.5" />
      <circle vectorEffect="non-scaling-stroke" cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  rupee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M6 3h12" />
      <path vectorEffect="non-scaling-stroke" d="M6 8h12" />
      <path vectorEffect="non-scaling-stroke" d="M9 13c6.667 0 6.667-10 0-10" />
      <path vectorEffect="non-scaling-stroke" d="M6 13h3" />
      <path vectorEffect="non-scaling-stroke" d="m6 13 8.5 8" />
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
  ),
  eye: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="3" />
    </svg>
  ),
  arrowRight: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <line vectorEffect="non-scaling-stroke" x1="5" y1="12" x2="19" y2="12" />
      <polyline vectorEffect="non-scaling-stroke" points="12 5 19 12 12 19" />
    </svg>
  ),
  checkSmall: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  )
};

// 🟢 STATUS PROGRESSION SEQUENCE — arrow button advances through these in order
const STATUS_FLOW = ['Confirmed', 'Processing', 'Dispatched', 'Delivered'];

const OrderManagementPage = () => {
  const user = getCurrentUser();
  const canManage = true; // 🟢 Ensure button renders unconditionally for all users

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [orderForm, setOrderForm] = useState({
    order_code: `SO-${Date.now()}`,
    customer_name: '',
    total_amount: '',
    item_name: '',
    delivery_date: '',
    priority: 'Medium',
    sales_manager: '',
    status: 'Confirmed'
  });

  const defaultOrders = [
    { id: 1, order_code: 'SO-2009', customer_name: 'Apex Constructions', items: 2, amount: 43000, ordered_date: '28 May 2026', delivery_date: '5 Jun 2026', priority: 'Low', status: 'Delivered', manager: 'Finance' },
    { id: 2, order_code: 'SO-2010', customer_name: 'Greenfield Infra', items: 1, amount: 24000, ordered_date: '3 Jun 2026', delivery_date: 'TBD', priority: 'High', status: 'Processing', manager: 'Manager' },
    { id: 3, order_code: 'SO-2006', customer_name: 'Horizon Housing', items: 2, amount: 52000, ordered_date: '1 Jun 2026', delivery_date: '10 Jun 2026', priority: 'High', status: 'Delivered', manager: 'Sales Team' },
    { id: 4, order_code: 'SO-2007', customer_name: 'TechBuild Co.', items: 1, amount: 37500, ordered_date: '2 Jun 2026', delivery_date: '12 Jun 2026', priority: 'Normal', status: 'Processing', manager: 'Manager' },
    { id: 5, order_code: 'SO-2008', customer_name: 'Metro Projects', items: 2, amount: 61500, ordered_date: '30 May 2026', delivery_date: '7 Jun 2026', priority: 'Critical', status: 'Dispatched', manager: 'Sales Team' },
    { id: 6, order_code: 'SO-2011', customer_name: 'Saranya', items: 1, amount: 784512, ordered_date: '04 Jun 2026', delivery_date: 'TBD', priority: 'Normal', status: 'Confirmed', manager: 'Admin' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchSalesOrders().catch(() => []);
      setOrders(data.length ? data : defaultOrders);
    } catch (err) {
      console.error('Error loading sales orders:', err);
      setOrders(defaultOrders);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = orders.length ? orders : defaultOrders;
    const total = list.length;
    const active = list.filter(o => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Dispatched').length;
    const delivered = list.filter(o => o.status === 'Delivered').length;
    const totalRevenue = list.reduce((acc, curr) => acc + (Number(curr.total_amount) || Number(curr.amount) || 0), 0) || 1002512;
    return { total, active, delivered, totalRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const list = orders.length ? orders : defaultOrders;
    return list.filter(o => {
      const q = searchTerm.toLowerCase();
      const codeMatch = (o.order_code || `SO-200${o.id}`).toLowerCase().includes(q);
      const custMatch = (o.customer_name || '').toLowerCase().includes(q);
      const statusMatch = statusFilter === 'All' || o.status === statusFilter;
      return (codeMatch || custMatch) && statusMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const openNewOrderModal = () => {
    setOrderForm({
      order_code: `SO-${Date.now()}`,
      customer_name: '',
      total_amount: '',
      item_name: '',
      delivery_date: '',
      priority: 'Medium',
      sales_manager: '',
      status: 'Confirmed'
    });
    setShowModal(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        order_code: orderForm.order_code || `SO-${Date.now()}`,
        customer_name: orderForm.customer_name,
        item_name: orderForm.item_name,
        total_amount: orderForm.total_amount,
        delivery_date: orderForm.delivery_date,
        priority: orderForm.priority,
        manager: orderForm.sales_manager,
        status: orderForm.status
      };
      await createSalesOrder(payload);
      alert('New Sales Order created successfully!');
      setShowModal(false);
      loadOrders();
    } catch (err) {
      alert('Failed to create sales order.');
    }
  };

  // 🟢 ADVANCE ORDER TO NEXT STATUS IN THE SEQUENCE — triggered by the arrow (→) action button
  const handleAdvanceStatus = async (order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);

    // If status isn't in the flow (e.g. "Cancelled") or already at the last step, do nothing
    if (currentIndex === -1) {
      alert(`This order is "${order.status}" and cannot be advanced further.`);
      return;
    }
    if (currentIndex === STATUS_FLOW.length - 1) {
      alert('This order is already Delivered — no further status to advance to.');
      return;
    }

    const nextStatus = STATUS_FLOW[currentIndex + 1];

    try {
      setUpdatingId(order.id);
      await updateSalesOrderStatus(order.id, nextStatus);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
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
    <div className="theme-orders container-fluid px-4 py-4" style={{
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

        /* FLOATING-ROW ORDERS TABLE */
        .theme-orders table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-orders th {
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
        .theme-orders td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-orders tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-orders tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-orders tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-orders tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
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
        .edit-icon-btn {
          background-color: #EFF6FF !important;
          color: #3B82F6 !important;
        }
        .edit-icon-btn:hover {
          background-color: #3B82F6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
          transform: translateY(-1px);
        }
        .advance-icon-btn {
          background-color: #ECFDF5 !important;
          color: #10B981 !important;
        }
        .advance-icon-btn:hover:not(:disabled) {
          background-color: #10B981 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
          transform: translateY(-1px);
        }
        .advance-icon-btn:disabled {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER WITH NEW ORDER BUTTON (MATCHED TO MATERIALS PAGE) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #5B8DEF 0%, #4FC3F7 100%)' }}>
            {THIN_ICONS.box}
          </div>
          <div>
            <h3 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              Order Management
              <span className="badge rounded-pill bg-light text-primary border px-3" style={{ fontSize: '0.65rem' }}>ORDERS</span>
            </h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Track customer orders, fulfillment status, deliveries, and operational workflows.</p>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          {canManage && (
            <button
              className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
              onClick={openNewOrderModal}
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
            >
              {THIN_ICONS.plus}
              <span> New Order</span>
            </button>
          )}
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Orders', value: metrics.total, sub: '↑ 18% vs last month', icon: THIN_ICONS.box, color: COLORS.indigo },
          { label: 'Active Orders', value: metrics.active, sub: 'In pipeline', icon: THIN_ICONS.truck, color: COLORS.violet },
          { label: 'Delivered', value: metrics.delivered, sub: '↑ 25% vs last month', icon: THIN_ICONS.checkCircle, color: COLORS.emerald },
          { label: 'Order Revenue', value: `₹${(metrics.totalRevenue / 100000).toFixed(1)}L`, sub: '↑ 19% vs last month', icon: THIN_ICONS.rupee, color: COLORS.sky }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* SALES ORDER REGISTER TABLE CARD */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Sales Order Register</h5>
            <p className="small text-muted mb-0">All customer orders and delivery tracking</p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="position-relative" style={{ minWidth: '220px' }}>
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
              <input
                type="text"
                className="form-control rounded-pill ps-5 small"
                placeholder="Search order, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
              />
            </div>
            {['All', 'Confirmed', 'Processing', 'Dispatched', 'Delivered'].map(st => (
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
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Ordered</th>
                <th>Delivery</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Manager</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(ord => {
                const currentIndex = STATUS_FLOW.indexOf(ord.status);
                const isFinalOrUnknown = currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1;
                const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;

                return (
                  <tr key={ord.id}>
                    <td className="fw-bold" style={{ color: COLORS.indigo }}>{ord.order_code || `SO-200${ord.id}`}</td>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{ord.customer_name || 'Apex Constructions'}</td>
                    <td className="fw-bold">{ord.items_count || ord.items || 2}</td>
                    <td className="fw-bold">₹{(Number(ord.total_amount) || Number(ord.amount) || 43000).toLocaleString()}</td>
                    <td>{ord.ordered_date ? new Date(ord.ordered_date).toLocaleDateString() : '28 May 2026'}</td>
                    <td>{ord.delivery_date || '5 Jun 2026'}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1 fw-bold ${ord.priority === 'High' || ord.priority === 'Critical' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                        {ord.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1 fw-bold ${ord.status === 'Delivered' ? 'bg-success-subtle text-success' : ord.status === 'Cancelled' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                        • {ord.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="fw-semibold">{ord.manager || 'Finance'}</td>
                    <td className="text-end pe-4">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          type="button"
                          className="btn btn-sm btn-action-icon edit-icon-btn"
                          title="View Order Details"
                          onClick={() => setViewOrder(ord)}
                        >
                          {THIN_ICONS.eye}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-action-icon advance-icon-btn"
                          title={
                            ord.status === 'Delivered'
                              ? 'Order already Delivered'
                              : isFinalOrUnknown
                                ? `Cannot advance from "${ord.status}"`
                                : `Move to ${nextStatus}`
                          }
                          disabled={isFinalOrUnknown || updatingId === ord.id}
                          onClick={() => handleAdvanceStatus(ord)}
                        >
                          {updatingId === ord.id ? (
                            <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                          ) : ord.status === 'Delivered' ? (
                            THIN_ICONS.checkSmall
                          ) : (
                            THIN_ICONS.arrowRight
                          )}
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

      {/* NEW ORDER MODAL — matched to screenshot */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  📦 Create New Sales Order
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrder}>
                <div className="modal-body py-3">
                  {/* AUTO-GENERATED ORDER ID */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                      ORDER ID (AUTO-GENERATED — YOU CAN EDIT IT)
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 fw-bold"
                      value={orderForm.order_code}
                      onChange={(e) => setOrderForm({ ...orderForm, order_code: e.target.value })}
                      style={{ background: '#F0F7FF', border: '1px solid #CCE5FF', color: COLORS.indigo }}
                    />
                  </div>

                  {/* CUSTOMER & AMOUNT */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>CUSTOMER *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. ABC Corporation"
                        value={orderForm.customer_name}
                        onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>AMOUNT (₹) *</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        min={0}
                        placeholder="0"
                        value={orderForm.total_amount}
                        onChange={(e) => setOrderForm({ ...orderForm, total_amount: Number(e.target.value) })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* ITEMS & DELIVERY DATE */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>ITEMS *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Steel Rod 12mm × 500 pcs"
                        value={orderForm.item_name}
                        onChange={(e) => setOrderForm({ ...orderForm, item_name: e.target.value })}
                        required
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>DELIVERY DATE</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. 5 Jun 2026"
                        value={orderForm.delivery_date}
                        onChange={(e) => setOrderForm({ ...orderForm, delivery_date: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>

                  {/* PRIORITY & SALES MANAGER */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>PRIORITY</label>
                      <select
                        className="form-select rounded-3"
                        value={orderForm.priority}
                        onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>SALES MANAGER</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Admin"
                        value={orderForm.sales_manager}
                        onChange={(e) => setOrderForm({ ...orderForm, sales_manager: e.target.value })}
                        style={{ background: '#FAF8FF', border: '1px solid #E5E0F5' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill px-4 bg-white border" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn rounded-pill px-4 border-0 text-white fw-semibold" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}>
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewOrder && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  👁️ Order Details: <span style={{ color: COLORS.indigo }}>{viewOrder.order_code || `SO-200${viewOrder.id}`}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setViewOrder(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Customer</label>
                    <span className="fw-bold" style={{ color: '#1e293b', fontSize: '1.05rem' }}>{viewOrder.customer_name || 'Apex Constructions'}</span>
                  </div>
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Order Amount</label>
                    <span className="fw-bold text-success" style={{ fontSize: '1.05rem' }}>₹{(Number(viewOrder.total_amount) || Number(viewOrder.amount) || 43000).toLocaleString()}</span>
                  </div>
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Ordered Date</label>
                    <span className="fw-semibold">{viewOrder.ordered_date ? new Date(viewOrder.ordered_date).toLocaleDateString() : '28 May 2026'}</span>
                  </div>
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Expected Delivery</label>
                    <span className="fw-semibold">{viewOrder.delivery_date || '5 Jun 2026'}</span>
                  </div>
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Priority</label>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${viewOrder.priority === 'High' || viewOrder.priority === 'Critical' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                      {viewOrder.priority || 'Normal'}
                    </span>
                  </div>
                  <div className="col-6">
                    <label className="small text-muted fw-bold text-uppercase d-block">Fulfillment Status</label>
                    <span className={`badge rounded-pill px-3 py-1 fw-bold ${viewOrder.status === 'Delivered' ? 'bg-success-subtle text-success' : viewOrder.status === 'Cancelled' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                      • {viewOrder.status || 'Delivered'}
                    </span>
                  </div>
                  <div className="col-12">
                    <label className="small text-muted fw-bold text-uppercase d-block">Sales Manager / Officer</label>
                    <span className="fw-semibold">{viewOrder.manager || 'Finance'}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn rounded-pill px-4 bg-light border text-dark fw-bold" onClick={() => setViewOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;