// src/pages/MaterialMovementsPage.js
import React, { useEffect, useState } from 'react';
import { fetchMovements, createMovement } from '../services/materialMovementService';

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

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await fetchMovements();
      setMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to download logs:", error);
      setErrorMsg('Failed to synchronize movement historical registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await createMovement(formData);
      setSuccessMsg(result.message || 'Movement recorded successfully.');

      setFormData({
        material_id: '',
        material_name: '',
        type: 'Inbound',
        quantity: '',
        from_location: '',
        to_location: '',
        performed_by: '',
        notes: ''
      });

      await loadMovements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Unable to register transit parameter records.');
    }
  };

  return (
    <div className="theme-materials container-fluid px-4 py-4" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>

      {/* 🟢 FIXED: REMOVED ALL HARDCODED LIGHT MAPPINGS (#ffffff) AND CONNECTED SYSTEM TO GLOBAL DARK TOKENS */}
      <style>{`
        .premium-card-lux {
          background-color: var(--surface) !important;
          border: 1px solid var(--card-border) !important;
          border-radius: 20px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease-in-out !important;
        }
        .premium-card-lux:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
        }
        .hover-row-lux {
          transition: background-color 0.15s ease !important;
        }
        .hover-row-lux:hover {
          background-color: var(--surface-alt) !important;
        }
        .hover-input-lux {
          background-color: var(--surface-alt) !important;
          color: var(--text) !important;
          border: 1px solid var(--card-border) !important;
          border-radius: 12px !important;
          padding: 0.65rem 1rem !important;
          font-weight: 500 !important;
          transition: all 0.18s ease-in-out !important;
        }
        .hover-input-lux:hover {
          border-color: #10b981 !important;
        }
        .hover-input-lux:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
          outline: none;
        }
        .hover-btn-lux {
          background: var(--page-gradient, linear-gradient(135deg, #10b981 0%, #059669 100%)) !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25) !important;
          filter: brightness(1.05);
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--card-border) !important' }}>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">📦</span>
          <h3 className="fw-bold mb-0">Material Movements Portal</h3>
        </div>
        <p className="text-muted mb-0">Monitor incoming inventory streams, internal logistics pathways, and warehouse balance nodes.</p>
      </div>

      {/* DYNAMIC ALERT BANNER ENGINE */}
      {errorMsg && (
        <div className="alert alert-danger border-0 p-3 rounded-4 small fw-semibold mb-4 shadow-sm" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
          ⚠️ Operational Notice: {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success border-0 p-3 rounded-4 small fw-semibold mb-4 shadow-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
          ✅ Transaction Success: {successMsg}
        </div>
      )}

      {/* MOVEMENT DATA ENTRY FORM */}
      <div className="card border-0 premium-card-lux p-4 mb-4">
        <h5 className="fw-bold mb-3">Record New Movement Parameters</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">Material ID *</label>
              <input type="number" name="material_id" className="form-control hover-input-lux" placeholder="e.g. 11" value={formData.material_id} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="small fw-bold text-muted mb-1">Material Name</label>
              <input type="text" name="material_name" className="form-control hover-input-lux" placeholder="e.g. Steel Rods" value={formData.material_name} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">Movement Type *</label>
              <select name="type" className="form-select hover-input-lux" style={{ cursor: 'pointer' }} value={formData.type} onChange={handleChange}>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Transfer">Transfer</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">Quantity *</label>
              <input type="number" step="0.01" name="quantity" className="form-control hover-input-lux" placeholder="0.00" value={formData.quantity} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="small fw-bold text-muted mb-1">From Location</label>
              <input type="text" name="from_location" className="form-control hover-input-lux" placeholder="e.g. Supplier" value={formData.from_location} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="small fw-bold text-muted mb-1">To Location</label>
              <input type="text" name="to_location" className="form-control hover-input-lux" placeholder="e.g. Warehouse A" value={formData.to_location} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="small fw-bold text-muted mb-1">Performed By</label>
              <input type="text" name="performed_by" className="form-control hover-input-lux" placeholder="Operator Name" value={formData.performed_by} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="small fw-bold text-muted mb-1">Notes / Remarks</label>
              <input type="text" name="notes" className="form-control hover-input-lux" placeholder="Batch or delivery details..." value={formData.notes} onChange={handleChange} />
            </div>
            <div className="col-12 mt-4">
              <button type="submit" className="btn hover-btn-lux px-5 py-2.5 text-white shadow-sm" disabled={loading}>
                {loading ? 'Processing Transit Node...' : '💾 Commit Material Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* HISTORY LEDGER LOGS TABLE */}
      <div className="card border-0 premium-card-lux p-0 overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--card-border) !important' }}>
          <h5 className="fw-bold mb-0">Movement History Ledger</h5>
          {loading && <div className="spinner-border spinner-border-sm text-success" role="status"></div>}
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light text-uppercase small fw-bold">
              <tr className="border-0">
                <th className="px-4 py-3">Type</th>
                <th className="py-3">Material Profile</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Locations Gateway</th>
                <th className="py-3">Performed By</th>
                <th className="py-3 pe-4 text-end">Logged Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {movements.length ? (
                movements.map((item) => {
                  const rawType = item.type ? item.type.trim().toLowerCase() : '';
                  let displayType = 'Transfer';
                  let badgeStyle = 'bg-info-subtle text-info-emphasis';

                  if (rawType === 'inbound') {
                    displayType = 'Inbound';
                    badgeStyle = 'bg-success-subtle text-success';
                  } else if (rawType === 'outbound') {
                    displayType = 'Outbound';
                    badgeStyle = 'bg-danger-subtle text-danger';
                  } else if (rawType === 'transfer') {
                    displayType = 'Transfer';
                    badgeStyle = 'bg-info-subtle text-info-emphasis';
                  } else if (rawType === 'adjustment') {
                    displayType = 'Adjustment';
                    badgeStyle = 'bg-warning-subtle text-warning-emphasis';
                  }

                  return (
                    <tr key={item.id} className="hover-row-lux">
                      <td className="px-4 py-3">
                        <span className={`badge px-3 py-1.5 rounded-pill fw-bold ${badgeStyle}`} style={{ fontSize: '0.74rem' }}>
                          {displayType}
                        </span>
                      </td>
                      <td>
                        <strong className="d-block" style={{ fontSize: '0.9rem' }}>{item.material_name || 'Unnamed Asset'}</strong>
                        <small className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>ID Reference: #{item.material_id || 'N/A'}</small>
                      </td>
                      <td className="fw-bold font-monospace">{item.quantity}</td>
                      <td>
                        <small className="text-muted fw-medium">
                          {item.from_location || 'Storage Ground'} <span className="mx-1 text-success">→</span> {item.to_location || 'Dispatched Out'}
                        </small>
                      </td>
                      <td className="text-muted fw-semibold" style={{ fontSize: '0.88rem' }}>{item.performed_by || 'System Scheduler'}</td>
                      <td className="text-muted small pe-4 text-end font-monospace">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '--/--/----'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5 fw-medium">
                    No active inventory movements found mapping onto current server indexes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialMovementsPage;