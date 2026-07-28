// src/pages/VendorsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../services/vendorService';

// ── VISUAL BRAND PALETTE CONFIGURATIONS ──────────────────────────────────
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

// ── CRISP-OPTIMIZED BOLD VECTOR SVG MATRIX WITH STROKE CORRECTIONS ────────
const METRIC_ICONS = {
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="2" y="3" width="20" height="18" rx="2" ry="2" />
      <path vectorEffect="non-scaling-stroke" d="M9 21V11h6v10" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="7" x2="8.01" y2="7" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="7" x2="12.01" y2="7" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="7" x2="16.01" y2="7" />
    </svg>
  ),
  handshake: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="8" r="4" />
      <path vectorEffect="non-scaling-stroke" d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  ),
  pauseCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="10" />
      <line vectorEffect="non-scaling-stroke" x1="10" y1="15" x2="10" y2="9" />
      <line vectorEffect="non-scaling-stroke" x1="14" y1="15" x2="14" y2="9" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
      <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'On Hold'
  const [formData, setFormData] = useState({
    vendor_name: '', contact_person: '', email: '', phone: '',
    address: '', category: '', rating: '', status: 'Active'
  });
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await fetchVendors();
      setVendors(data || []);
    } catch (error) {
      console.error("Database connection failure context:", error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(vendors.map(v => v.category).filter(Boolean)));
  }, [vendors]);

  const metrics = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter(v => v.status?.toLowerCase() === 'active').length;
    const onHold = vendors.filter(v => v.status?.toLowerCase() === 'on hold').length;
    const avgRating = total > 0
      ? (vendors.reduce((acc, v) => acc + (parseFloat(v.rating) || 0), 0) / total).toFixed(1)
      : '0.0';
    return { total, active, onHold, avgRating };
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      // 1. Text Search Filter
      const matchesSearch =
        (v.vendor_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.contact_person || '').toLowerCase().includes(search.toLowerCase());

      // 2. Quick Tab Status Filter
      const matchesStatus =
        statusFilter === 'All' ||
        (v.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditClick = (vendor) => {
    setActiveVendorId(vendor.id);
    setFormData({
      vendor_name: vendor.vendor_name || '',
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      category: vendor.category || '',
      rating: vendor.rating || '',
      status: vendor.status || 'Active'
    });
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setActiveVendorId(null);
    setFormData({
      vendor_name: '', contact_person: '', email: '', phone: '',
      address: '', category: '', rating: '', status: 'Active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeVendorId) {
        await updateVendor(activeVendorId, formData);
      } else {
        await createVendor(formData);
      }
      handleCancelForm();
      loadVendors();
    } catch (error) {
      console.error("Could not register or modify entity payload profiles:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this vendor registry record?')) return;
    try {
      await deleteVendor(id);
      loadVendors();
    } catch (error) {
      console.error(error);
    }
  };

  // ── Pure-White Ring Circular Card Matching Materials Metric Components ──
  const MetricCard = ({ label, value, sub, icon, color }) => (
    <div className="card border-0 h-100 metric-card-lux" style={{ borderRadius: '22px', background: '#ffffff' }}>
      <div className="p-3 d-flex align-items-center gap-3">
        <div className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#ffffff', color: color,
            border: `2px solid ${color}40`
          }}>
          {icon}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h3 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</h3>
          <span className="d-block fw-semibold" style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.25, marginTop: '2px' }}>{label}</span>
        </div>
      </div>
      {sub && (
        <div className="px-3 pb-3" style={{ marginTop: '-4px' }}>
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
        /* Premium Global Elements */
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
        
        .search-container-lux {
          position: relative;
        }
        .search-icon-lux {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .search-input-with-icon {
          padding-left: 38px !important;
        }

        /* PREMIUM DYNAMIC TAB FILTERS */
        .filter-pill-container {
          background-color: #f8f6ff;
          padding: 4px;
          border-radius: 12px;
          display: inline-flex;
          gap: 4px;
          border: 1px solid #e2def5;
        }
        .filter-pill {
          border: none;
          background: transparent;
          padding: 6px 16px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          border-radius: 9px;
          transition: all 0.2s ease;
        }
        .filter-pill:hover {
          color: #1e293b;
        }
        .filter-pill.active-all {
          background-color: #ffffff;
          color: ${COLORS.indigo};
          box-shadow: 0 2px 8px rgba(91, 141, 239, 0.12);
        }
        .filter-pill.active-active {
          background-color: #ffffff;
          color: #0f9488;
          box-shadow: 0 2px 8px rgba(46, 217, 195, 0.15);
        }
        .filter-pill.active-onhold {
          background-color: #ffffff;
          color: #b45309;
          box-shadow: 0 2px 8px rgba(255, 197, 66, 0.2);
        }

        /* INVENTORY LEDGER LAYOUT RULES */
        .theme-materials table {
          width: 100% !important;
          border-collapse: collapse !important;
          background-color: #ffffff !important;
        }
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
        .theme-materials .mat-name-cell {
          font-weight: 700 !important;
          color: #1a202c !important;
        }
        .theme-materials .mat-subtitle {
          font-size: 0.78rem !important;
          color: #a0aec0 !important;
          margin-top: 2px;
          font-weight: 400 !important;
        }
        .theme-materials .badge-category {
          background-color: ${COLORS.indigo}14 !important;
          color: ${COLORS.indigo} !important;
          border: 1px solid ${COLORS.indigo}33 !important;
          padding: 4px 14px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          display: inline-block;
        }
        .theme-materials .status-active {
          background-color: ${COLORS.emerald}14 !important;
          color: #0f9488 !important;
          border: 1px solid ${COLORS.emerald}44 !important;
        }
        .theme-materials .status-onhold {
          background-color: ${COLORS.amber}18 !important;
          color: #b45309 !important;
          border: 1px solid ${COLORS.amber}44 !important;
        }
        .theme-materials .status-badge-base {
          padding: 4px 12px !important;
          border-radius: 20px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-block;
        }
        
        .inline-star-align {
          display: inline-flex;
          align-items: center;
          gap: 4px;
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

      {/* HEADER NAV PANEL */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {METRIC_ICONS.building}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Vendors Dashboard</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Manage supplier registries and structural vendor relationship indexes</p>
          </div>
        </div>
        {!isEditing && (
          <div className="d-flex align-items-center justify-content-end">
            <button
              className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white"
              onClick={() => setIsEditing(true)}
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
            >
              + Register New Vendor
            </button>
          </div>
        )}
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRICS DISPLAYS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Vendors', value: metrics.total, sub: 'Registered entities', icon: METRIC_ICONS.building, color: COLORS.indigo },
          { label: 'Active Partners', value: metrics.active, sub: 'System operational', icon: METRIC_ICONS.handshake, color: COLORS.emerald },
          { label: 'On Hold Nodes', value: metrics.onHold, sub: 'Suspended profiles', icon: METRIC_ICONS.pauseCircle, color: COLORS.amber },
          { label: 'Avg. Rating', value: metrics.avgRating, sub: 'Performance index', icon: METRIC_ICONS.star, color: COLORS.violet }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* POPUP MODAL OVERLAY MATCHING ADD NEW MATERIAL FORM EXACTLY */}
      {isEditing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelForm();
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
                  {activeVendorId ? 'Edit Vendor Profile' : 'Add New Vendor'}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close rounded-circle p-2"
                style={{ backgroundColor: '#F1F5F9' }}
                onClick={handleCancelForm}
                aria-label="Close"
              ></button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit} className="p-2">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">VENDOR NAME *</label>
                  <input
                    type="text"
                    name="vendor_name"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Apex Steel Corp"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">CONTACT PERSON *</label>
                  <input
                    type="text"
                    name="contact_person"
                    className="form-control modal-input-lux"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">EMAIL *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control modal-input-lux"
                    placeholder="contact@vendor.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">PHONE *</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control modal-input-lux"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">CATEGORY</label>
                  {uniqueCategories.length > 0 ? (
                    <>
                      <input
                        type="text"
                        name="category"
                        list="dl-categories"
                        className="form-control modal-input-lux"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Select or enter category"
                        required
                      />
                      <datalist id="dl-categories">
                        {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    </>
                  ) : (
                    <input
                      type="text"
                      name="category"
                      className="form-control modal-input-lux"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g. Metals & Alloys"
                      required
                    />
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">RATING (0.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    className="form-control modal-input-lux"
                    placeholder="4.5"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">STATUS</label>
                  <select
                    name="status"
                    className="form-select modal-input-lux"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="modal-label-lux">ADDRESS / LOCATION</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control modal-input-lux"
                    placeholder="City, State"
                    value={formData.address}
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
                    style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}
                  >
                    {activeVendorId ? 'Save Changes' : 'Add Vendor'}
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    type="button"
                    className="btn w-100 py-2.5 rounded-3 fw-bold border-0"
                    style={{ background: '#F1F5F9', color: '#475569' }}
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-eyebrow">Operational Registers</div>

      {/* OPERATIONAL DATA DIRECTORY */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 bg-white border-bottom d-flex flex-column lg-flex-row gap-3 align-items-start align-items-md-center justify-content-between" style={{ borderColor: '#f1f0f9' }}>
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.1rem' }}>Vendor Operational Directory</h5>

          {/* CONTROL SUITE PANEL (TAB FILTERS + SEARCH INLINE) */}
          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3 w-100 w-md-auto">

            {/* QUICK STATUS PILL FILTER TABS */}
            <div className="filter-pill-container align-self-start align-self-sm-center">
              {['All', 'Active', 'On Hold'].map((status) => {
                const normalizedKey = status.toLowerCase().replace(/\s+/g, '');
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`filter-pill ${isActive ? `active-${normalizedKey}` : ''}`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* LIVE SEARCH BAR BOX */}
            <div className="search-container-lux" style={{ minWidth: '240px' }}>
              <span className="search-icon-lux">{METRIC_ICONS.search}</span>
              <input
                className="form-control hover-input-lux search-input-with-icon w-100"
                placeholder="Search vendor matrix..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>
        </div>

        {loading && vendors.length === 0 ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live partner profiles...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-4">Vendor Entity</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Status Monitor</th>
                  <th className="text-center px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map(v => {
                  const statusNormalized = (v.status || 'Active').replace(/\s+/g, '').toLowerCase();
                  const statusClass = `status-${statusNormalized === 'onhold' ? 'onhold' : 'active'}`;
                  return (
                    <tr key={v.id}>
                      <td className="px-4">
                        <div className="mat-name-cell">{v.vendor_name}</div>
                        <div className="mat-subtitle">
                          {v.contact_person ? `${v.contact_person} • ` : ''}{v.email || 'No Email Record'}{v.phone ? ` • ${v.phone}` : ''}
                        </div>
                        {v.address && <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '1px' }}>{v.address}</div>}
                      </td>
                      <td>
                        <span className="badge-category">{v.category || 'Unassigned'}</span>
                      </td>
                      <td className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <div className="inline-star-align">
                          <span style={{ color: COLORS.amber, display: 'inline-flex' }}>{METRIC_ICONS.star}</span>
                          <span>{v.rating ? parseFloat(v.rating).toFixed(1) : '0.0'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge-base ${statusClass}`}>
                          {v.status || 'Active'}
                        </span>
                      </td>
                      <td className="text-center px-4">
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          <button
                            className="btn-action-icon edit-icon-btn"
                            onClick={() => handleEditClick(v)}
                            title="Edit Vendor Profile"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-action-icon del-icon-btn"
                            onClick={() => handleDelete(v.id)}
                            title="Remove Vendor"
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
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-5 text-muted fw-medium">No matching vendor entries found.</td>
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

export default VendorsPage;