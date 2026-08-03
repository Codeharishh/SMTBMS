// src/pages/MaterialsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materialService';
import MaterialTable from '../components/MaterialTable';
import MaterialForm from '../components/MaterialForm';
import { Html5QrcodeScanner } from 'html5-qrcode';

// ── SAME PALETTE AS DashboardPage.js FOR VISUAL CONSISTENCY ────────────────
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

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const THIN_ICONS = {
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline vectorEffect="non-scaling-stroke" points="3.27 6.96 12 12.01 20.73 6.96" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  warehouse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M3 21h18" />
      <path vectorEffect="non-scaling-stroke" d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3" />
      <path vectorEffect="non-scaling-stroke" d="M4 21V10h16v11" />
      <rect vectorEffect="non-scaling-stroke" x="9" y="14" width="6" height="7" />
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
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
};

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(materials.map((item) => item.category).filter(Boolean)));
  }, [materials]);

  const metrics = useMemo(() => {
    const total = materials.length;
    let inStock = 0;
    let inTransit = 0;
    let lowStock = 0;
    let outOfStock = 0;

    materials.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const minQty = Number(item.min_quantity || item.low_stock_threshold || 10);
      const status = (item.status || '').toLowerCase();

      if (qty === 0 || status.includes('out')) {
        outOfStock += 1;
      } else if (status === 'in transit' || status === 'transit') {
        inTransit += qty;
      } else {
        inStock += qty;
      }

      if (qty <= minQty && qty > 0 && !status.includes('transit')) {
        lowStock += 1;
      }
    });

    return { total, inStock, inTransit, lowStock, outOfStock };
  }, [materials]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await fetchMaterials();
      setMaterials(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, false);

      scanner.render((decodedText) => {
        setSearchValue(decodedText);
        setIsScanning(false);
        scanner.clear();
      }, (error) => {
        // Silent catch for telemetry
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner failed shutdown:", err));
      }
    };
  }, [isScanning]);

  const handleSave = async (payload) => {
    try {
      if (activeMaterial && activeMaterial.id) {
        await updateMaterial(activeMaterial.id, payload);
      } else {
        await createMaterial(payload);
      }
      setActiveMaterial(null);
      await loadMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this material registry record?')) return;
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (error) {
      console.error(error);
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

        /* INVENTORY REGISTER REFERENCE TABLE IMPLEMENTATION */
        .theme-materials table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }

        .theme-materials th {
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

        .theme-materials td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }

        .theme-materials tr td:first-child {
          border-top-left-radius: 14px !important;
          border-bottom-left-radius: 14px !important;
        }

        .theme-materials tr td:last-child {
          border-top-right-radius: 14px !important;
          border-bottom-right-radius: 14px !important;
        }

        .theme-materials tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }

        .theme-materials tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
          background-color: #ffffff !important;
        }

        /* ── ACTION ICON BUTTONS (matched to VendorsPage) ── */
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

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.box}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Inventory Register</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">All materials — linked to Movement & Stock pages</p>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white"
            onClick={() => setActiveMaterial({})}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Items Type', value: metrics.total, sub: 'Unique ledger SKUs', icon: THIN_ICONS.box, color: COLORS.indigo },
          { label: 'Total Stock Volume', value: metrics.inStock.toLocaleString(), sub: 'Available in warehouse', icon: THIN_ICONS.warehouse, color: COLORS.emerald },
          { label: 'Items In Transit', value: metrics.inTransit.toLocaleString(), sub: 'Active cargo shipments', icon: THIN_ICONS.truck, color: COLORS.sky },
          { label: 'Low Stock Alerts', value: metrics.lowStock, sub: 'Requires replenishment', icon: THIN_ICONS.alertTriangle, color: COLORS.rose }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* POPUP MODAL OVERLAY MATCHING REFERENCE SCREENSHOT EXACTLY */}
      {activeMaterial && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveMaterial(null);
          }}
        >
          <div
            className="card border-0 shadow-lg p-4 animate__animated animate__fadeInUp hide-scrollbar-lux"
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              maxHeight: '92vh',
              overflowY: 'auto',
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none'  /* IE/Edge */
            }}
          >
            <style>{`
              .hide-scrollbar-lux::-webkit-scrollbar {
                display: none !important; /* Chrome, Safari, Opera */
                width: 0 !important;
                height: 0 !important;
              }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '32px', height: '32px', background: '#F5F3FF', color: COLORS.indigo }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b', fontSize: '1.25rem' }}>
                  {activeMaterial.id ? 'Edit Material' : 'Add New Material'}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close rounded-circle p-2"
                style={{ backgroundColor: '#F1F5F9' }}
                onClick={() => setActiveMaterial(null)}
                aria-label="Close"
              ></button>
            </div>
            <MaterialForm activeMaterial={activeMaterial} onSave={handleSave} onCancel={() => setActiveMaterial(null)} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing live inventory registries...
          </div>
        </div>
      ) : (
        <MaterialTable
          materials={materials}
          onEdit={(item) => setActiveMaterial(item)}
          onDelete={handleDelete}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
    </div>
  );
};

export default MaterialsPage;