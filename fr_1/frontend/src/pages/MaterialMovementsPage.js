// src/pages/MaterialMovementsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchMovements, createMovement } from '../services/materialMovementService';

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

// ── CRISP-OPTIMIZED BOLD VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const MOVEMENT_ICONS = {
  ledger: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline vectorEffect="non-scaling-stroke" points="14 2 14 8 20 8" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="13" x2="8" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="17" x2="8" y2="17" />
      <polyline vectorEffect="non-scaling-stroke" points="10 9 9 9 8 9" />
    </svg>
  ),
  inbound: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="17 11 12 16 7 11" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="4" x2="12" y2="16" />
      <path vectorEffect="non-scaling-stroke" d="M22 20H2" />
    </svg>
  ),
  outbound: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="7 9 12 4 17 9" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="20" x2="12" y2="4" />
      <path vectorEffect="non-scaling-stroke" d="M22 20H2" />
    </svg>
  ),
  transfer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="17 1 21 5 17 9" />
      <path vectorEffect="non-scaling-stroke" d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline vectorEffect="non-scaling-stroke" points="7 23 3 19 7 15" />
      <path vectorEffect="non-scaling-stroke" d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
};

const MaterialMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [formData, setFormData] = useState({
    material_id: '',
    material_name: '',
    type: 'Inbound',
    quantity: '',
    from_location: '',
    to_location: '',
    performed_by: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = movements.length;
    const inbound = movements.filter(m => m.type?.toLowerCase() === 'inbound').length;
    const outbound = movements.filter(m => m.type?.toLowerCase() === 'outbound').length;
    const transfers = movements.filter(m => m.type?.toLowerCase() === 'transfer').length;
    return { total, inbound, outbound, transfers };
  }, [movements]);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await fetchMovements();
      setMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg('Failed to synchronize movement historical registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMovement(formData);
      setSuccessMsg('Transaction recorded successfully.');
      setFormData({ material_id: '', material_name: '', type: 'Inbound', quantity: '', from_location: '', to_location: '', performed_by: '', notes: '' });
      setIsFormOpen(false);
      await loadMovements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Unable to register transit records.');
    }
  };

  // ── Circular ring-icon metric card matching MaterialsPage style ──
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
        .metric-card-lux {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          box-shadow: 0 8px 22px rgba(31,41,55,0.05) !important;
        }
        .metric-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 26px rgba(31,41,55,0.09) !important;
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
        .hover-input-lux {
          background-color: #FAF8FF !important;
          border: 1px solid #e5e0f5 !important;
          border-radius: 10px !important;
          color: #4a5568 !important;
          font-size: 0.9rem !important;
          padding: 10px 14px !important;
        }
        .hover-input-lux:focus {
          border-color: ${COLORS.primary}88 !important;
          box-shadow: 0 0 0 3px ${COLORS.primary}1A !important;
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
          text-align: left !important;
        }

        /* Row Layout Mapping */
        .theme-materials td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          border-bottom: 1px solid #f4f2fb !important;
          color: #4a5568 !important;
          font-size: 0.92rem !important;
          text-align: left !important;
        }

        .theme-materials tbody tr {
          transition: background-color 0.15s ease !important;
        }
        .theme-materials tbody tr:hover {
          background-color: #FDFAFF !important;
        }

        /* Material ID Format Styling */
        .theme-materials .mat-id-cell {
          color: ${COLORS.indigo} !important;
          font-weight: 700 !important;
        }

        /* Text Custom Boldings Mapping */
        .theme-materials .mat-name-cell {
          font-weight: 700 !important;
          color: #1a202c !important;
        }
        .theme-materials .mat-qty-cell {
          font-weight: 700 !important;
          color: #2d3748 !important;
        }

        /* Nested Secondary Subtitle Details */
        .theme-materials .mat-subtitle {
          font-size: 0.78rem !important;
          color: #a0aec0 !important;
          margin-top: 2px;
          font-weight: 400 !important;
        }

        /* Dynamic Badge Color Framework */
        .theme-materials .badge-inbound {
          background-color: ${COLORS.emerald}14 !important;
          color: #0f9488 !important;
          border: 1px solid ${COLORS.emerald}44 !important;
        }
        .theme-materials .badge-outbound {
          background-color: ${COLORS.alert}14 !important;
          color: #dc2626 !important;
          border: 1px solid ${COLORS.alert}44 !important;
        }
        .theme-materials .badge-transfer {
          background-color: ${COLORS.indigo}14 !important;
          color: ${COLORS.indigo} !important;
          border: 1px solid ${COLORS.indigo}33 !important;
        }
        .theme-materials .badge-adjustment {
          background-color: ${COLORS.amber}18 !important;
          color: #b45309 !important;
          border: 1px solid ${COLORS.amber}44 !important;
        }
        .theme-materials .movement-badge-base {
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER WITH RECORD MOVEMENT BUTTON */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {MOVEMENT_ICONS.transfer}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Material Movements Portal</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Monitor incoming streams, internal logistics, and warehouse balance nodes</p>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white"
            onClick={() => setIsFormOpen(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            + Record Movement
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST ALERTS */}
      {successMsg && (
        <div className="alert border-0 text-white shadow-sm mb-4 p-3 d-flex align-items-center rounded-4" style={{ background: `linear-gradient(135deg, ${COLORS.emerald} 0%, #10B981 100%)`, borderRadius: '16px' }}>
          <span className="me-2">✨</span> <small className="fw-bold">{successMsg}</small>
        </div>
      )}
      {errorMsg && (
        <div className="alert border-0 text-white shadow-sm mb-4 p-3 d-flex align-items-center rounded-4" style={{ background: `linear-gradient(135deg, ${COLORS.alert} 0%, #EF4444 100%)`, borderRadius: '16px' }}>
          <span className="me-2">⚠️</span> <small className="fw-bold">{errorMsg}</small>
        </div>
      )}

      <div className="section-eyebrow">Overview</div>

      {/* METRICS DISPLAYS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Movements', value: metrics.total, sub: 'All recorded logs', icon: MOVEMENT_ICONS.ledger, color: COLORS.indigo },
          { label: 'Inbound Total', value: metrics.inbound, sub: 'Incoming shipments', icon: MOVEMENT_ICONS.inbound, color: COLORS.emerald },
          { label: 'Outbound Total', value: metrics.outbound, sub: 'Outgoing dispatches', icon: MOVEMENT_ICONS.rose, color: COLORS.rose },
          { label: 'Internal Transfers', value: metrics.transfers, sub: 'Warehouse movements', icon: MOVEMENT_ICONS.transfer, color: COLORS.sky }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* FILTER PILLS MATRIX MATCHING DESIGN SCREENSHOT */}
      <div className="d-flex align-items-center gap-2 mb-4">
        {['All', 'Inbound', 'Outbound', 'Transfer'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm px-4 py-2 rounded-pill fw-bold ${statusFilter === tab ? 'btn-primary text-white shadow-sm' : 'btn-light border text-muted'}`}
            style={statusFilter === tab ? { background: '#2563eb', borderColor: '#2563eb' } : { backgroundColor: '#ffffff', color: '#475569' }}
            onClick={() => setStatusFilter(tab)}
          >
            {tab === 'Inbound' ? 'IN' : tab === 'Outbound' ? 'OUT' : tab === 'Transfer' ? 'TRANSFER' : 'All'}
          </button>
        ))}
      </div>

      {/* POPUP MODAL OVERLAY MATCHING ADD NEW MATERIAL FORM EXACTLY */}
      {isFormOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div
            className="card border-0 shadow-lg p-4 animate__animated animate__fadeInUp hide-scrollbar-lux"
            style={{
              width: '100%',
              maxWidth: '580px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              maxHeight: '92vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`
              .hide-scrollbar-lux::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              .modal-input-lux {
                background-color: #F1F5F9 !important;
                border: 1px solid #E2E8F0 !important;
                border-radius: 12px !important;
                padding: 0.5rem 0.85rem !important;
                font-weight: 600 !important;
                color: #334155 !important;
                font-size: 0.86rem !important;
              }
              .modal-input-lux:focus {
                border-color: #FF7A45 !important;
                box-shadow: 0 0 0 3px rgba(255, 122, 69, 0.15) !important;
              }
              .modal-label-lux {
                font-size: 0.68rem !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.04em !important;
                color: #64748B !important;
                margin-bottom: 4px !important;
              }
            `}</style>

            {/* MODAL HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '32px', height: '32px', background: '#F5F3FF', color: COLORS.indigo }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.25rem' }}>
                  Record New Movement
                </h5>
              </div>
              <button
                type="button"
                className="btn-close rounded-circle p-2"
                style={{ backgroundColor: '#F1F5F9' }}
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
              ></button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit} className="p-2">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">MATERIAL ID *</label>
                  <input
                    type="text"
                    name="material_id"
                    className="form-control modal-input-lux font-monospace text-primary fw-bold"
                    placeholder="MAT-009"
                    value={formData.material_id}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">MATERIAL NAME *</label>
                  <input
                    type="text"
                    name="material_name"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Steel Rod 12mm"
                    value={formData.material_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">MOVEMENT TYPE *</label>
                  <select
                    name="type"
                    className="form-select modal-input-lux"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">QUANTITY *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control modal-input-lux"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">FROM LOCATION</label>
                  <input
                    type="text"
                    name="from_location"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Supplier Yard"
                    value={formData.from_location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">TO LOCATION</label>
                  <input
                    type="text"
                    name="to_location"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Warehouse A"
                    value={formData.to_location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">PERFORMED BY *</label>
                  <input
                    type="text"
                    name="performed_by"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Store Keeper"
                    value={formData.performed_by}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">MEMO / NOTES</label>
                  <input
                    type="text"
                    name="notes"
                    className="form-control modal-input-lux"
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="row g-3 mt-4 pt-2">
                <div className="col-12 col-md-6">
                  <button
                    type="submit"
                    className="btn w-100 py-2.5 rounded-3 fw-bold text-white border-0 shadow-sm hover-btn-lux"
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}
                  >
                    {loading ? 'Processing...' : 'Record Movement'}
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    type="button"
                    className="btn w-100 py-2.5 rounded-3 fw-bold border-0"
                    style={{ background: '#F1F5F9', color: '#475569' }}
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-eyebrow">Movement Registers</div>

      {/* CLEAN BACKGROUND WRAPPER CONTAINER FOR LOGISTICS TABLE */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        {loading && movements.length === 0 ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live ledger transit streams...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-4">Type</th>
                  <th>Material Profile</th>
                  <th>Qty</th>
                  <th>Path Logistics</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {movements
                  .filter(m => {
                    if (statusFilter === 'All') return true;
                    return m.type?.toLowerCase() === statusFilter.toLowerCase();
                  })
                  .map((item) => {
                  const typeClass = `badge-${(item.type || 'inbound').toLowerCase()}`;
                  return (
                    <tr key={item.id}>
                      <td className="px-4">
                        <span className={`movement-badge-base ${typeClass}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <div className="mat-name-cell">{item.material_name}</div>
                        <div className="mat-subtitle">ID: <span className="mat-id-cell">{item.material_id}</span></div>
                      </td>
                      <td className="mat-qty-cell">
                        {Number(item.quantity || 0).toLocaleString()}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
                          {item.from_location || '—'} → {item.to_location || '—'}
                        </div>
                        {item.notes && <div className="mat-subtitle">Memo: {item.notes}</div>}
                      </td>
                      <td>
                        <div className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="mat-subtitle" style={{ fontSize: '0.74rem' }}>
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted fw-medium">No movement registries tracked yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialMovementsPage;