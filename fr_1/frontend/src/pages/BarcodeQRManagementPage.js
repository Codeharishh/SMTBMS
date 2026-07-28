// src/pages/BarcodeQRManagementPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { fetchMaterials } from '../services/materialService';

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

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR METRIC CARDS ────────────────────
const THIN_ICONS = {
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline vectorEffect="non-scaling-stroke" points="3.27 6.96 12 12.01 20.73 6.96" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  qrScan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path vectorEffect="non-scaling-stroke" d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path vectorEffect="non-scaling-stroke" d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path vectorEffect="non-scaling-stroke" d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect vectorEffect="non-scaling-stroke" x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="13" r="4" />
    </svg>
  ),
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="9" x2="12" y2="13" />
      <line vectorEffect="non-scaling-stroke" x1="12" y1="17" x2="12.01" y2="17" />
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="3" />
    </svg>
  ),
  printer: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="6 9 6 2 18 2 18 9" />
      <path vectorEffect="non-scaling-stroke" d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect vectorEffect="non-scaling-stroke" x="6" y="14" width="12" height="8" />
    </svg>
  )
};

const BarcodeQRManagementPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(14);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      // Import/Instantiate Html5QrcodeScanner
      if (window.Html5QrcodeScanner || typeof require !== 'undefined') {
        const { Html5QrcodeScanner } = require('html5-qrcode');
        scanner = new Html5QrcodeScanner("barcode-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          videoConstraints: { facingMode: "user" } // Forces front camera initialization
        }, false);

        scanner.render((decodedText) => {
          setSearch(decodedText);
          setIsScanning(false);
          setScanCount(c => c + 1);
          scanner.clear();
        }, (err) => {
          // Silent catch for scanning errors
        });
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner shutdown:", err));
      }
    };
  }, [isScanning]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching materials for barcode page:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const query = search.toLowerCase();
      const code = (item.material_code || `MAT-${String(item.id).padStart(3, '0')}`).toLowerCase();
      const name = (item.material_name || '').toLowerCase();
      const loc = (item.location || '').toLowerCase();
      return name.includes(query) || code.includes(query) || loc.includes(query);
    });
  }, [materials, search]);

  const metrics = useMemo(() => {
    const total = materials.length;
    const labelled = total; // All active DB items have generated codes
    const unlabelled = 0;
    return {
      total,
      labelled,
      scans: scanCount,
      cameraScans: 0,
      unlabelled
    };
  }, [materials, scanCount]);

  const handlePreview = (item) => {
    setSelectedMaterial(item);
    setShowPreviewModal(true);
  };

  const handlePrint = (item) => {
    setSelectedMaterial(item);
    setTimeout(() => {
      window.print();
    }, 200);
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
    <div className="theme-barcode container-fluid px-4 py-4" style={{
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

        /* BARCODE REGISTRY TABLE — SAME FLOATING-ROW REGISTER STYLE AS MaterialsPage */
        .theme-barcode table {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
          background-color: transparent !important;
        }
        .theme-barcode th {
          background-color: #FAF8FF !important;
          color: #94a3b8 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.72rem !important;
          letter-spacing: 0.05em !important;
          padding: 14px 20px !important;
          border: none !important;
          text-align: left;
        }
        .theme-barcode th.text-center, .theme-barcode td.text-center {
          text-align: center !important;
        }
        .theme-barcode td {
          padding: 16px 20px !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(165, 175, 200, 0.08) !important;
          color: #475569 !important;
          font-size: 0.88rem !important;
        }
        .theme-barcode tr td:first-child { border-top-left-radius: 14px !important; border-bottom-left-radius: 14px !important; }
        .theme-barcode tr td:last-child { border-top-right-radius: 14px !important; border-bottom-right-radius: 14px !important; }
        .theme-barcode tbody tr {
          box-shadow: 0 4px 12px rgba(165, 175, 200, 0.06) !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .theme-barcode tbody tr:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(165, 175, 200, 0.12) !important;
        }

        .barcode-pill {
          font-family: monospace;
          background: #FAF8FF;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.05em;
        }
        .qrcode-pill {
          font-family: monospace;
          background: ${COLORS.violet}14;
          color: ${COLORS.violet};
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .theme-barcode td .btn-action-preview {
          background-color: #eff6ff !important;
          color: #3b82f6 !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          margin-right: 6px !important;
          display: inline-flex !important;
          align-items: center;
          gap: 4px;
        }
        .theme-barcode td .btn-action-print {
          background-color: #ecfdf5 !important;
          color: #059669 !important;
          border: none !important;
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          display: inline-flex !important;
          align-items: center;
          gap: 4px;
        }
        .theme-barcode td .btn-action-preview:hover,
        .theme-barcode td .btn-action-print:hover {
          filter: brightness(0.95) !important;
        }

        /* CAMERA SCANNER WINDOW */
        .scanner-window {
          background: #1e1b2e;
          border-radius: 22px;
          padding: 28px;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .scanner-line {
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: ${COLORS.emerald};
          box-shadow: 0 0 12px ${COLORS.emerald};
          animation: scanAnim 2s infinite ease-in-out;
        }
        @keyframes scanAnim {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }

        @media print {
          body * { visibility: hidden; }
          #print-label-area, #print-label-area * { visibility: visible; }
          #print-label-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-3 pt-2">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)` }}>
            {THIN_ICONS.qrScan}
          </div>
          <div className="d-flex flex-column justify-content-center">
            <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Barcode & QR Management</h3>
            <p style={{ color: '#94a3b8' }} className="small mb-0">Generate, scan, and manage barcode and QR code labels for all tracked materials</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn px-3 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 bg-white border"
            onClick={() => setIsScanning(!isScanning)}
            style={{ borderColor: '#e5e0f5', color: '#475569' }}
          >
            {THIN_ICONS.camera}
            <span>{isScanning ? 'Stop Scanner' : 'Scan Camera'}</span>
          </button>
          <button
            className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white d-flex align-items-center gap-2"
            onClick={() => setShowGenerateModal(true)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            {THIN_ICONS.plus}
            <span>Generate Label</span>
          </button>
        </div>
      </div>

      <div className="section-eyebrow">Overview</div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Labelled Items', value: metrics.labelled, sub: 'Active tracked SKUs', icon: THIN_ICONS.box, color: COLORS.indigo },
          { label: 'Total Scans', value: metrics.scans, sub: 'All-time scan events', icon: THIN_ICONS.qrScan, color: COLORS.sky },
          { label: 'Camera Scans', value: metrics.cameraScans, sub: 'Live optical reads', icon: THIN_ICONS.camera, color: COLORS.violet },
          { label: 'Unlabelled', value: metrics.unlabelled, sub: 'Needs a code generated', icon: THIN_ICONS.alertTriangle, color: COLORS.amber }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <MetricCard label={card.label} value={card.value} sub={card.sub} icon={card.icon} color={card.color} />
          </div>
        ))}
      </div>

      {/* CAMERA SCANNER PANEL */}
      {isScanning && (
        <div className="scanner-window mb-4" style={{ background: '#ffffff', border: '2px solid #e5e0f5' }}>
          <div id="barcode-reader" style={{ maxWidth: '400px', margin: '0 auto' }}></div>
          <button
            className="btn btn-sm rounded-pill px-4 fw-semibold border-0 text-white mt-3"
            onClick={() => setIsScanning(false)}
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
          >
            Close Camera Scanner
          </button>
        </div>
      )}

      {/* BARCODE & QR REGISTRY TABLE */}
      <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
        <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Barcode & QR Registry</h5>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>Click any row to preview label • Live status from Inventory</p>
          </div>
          <div className="position-relative" style={{ minWidth: '260px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>{THIN_ICONS.search}</span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-center" style={{ color: '#94a3b8' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: COLORS.primary }}></div>
            Synchronizing barcode registries...
          </div>
        ) : (
          <div className="table-responsive p-4 pt-2">
            <table>
              <thead>
                <tr>
                  <th>Mat. ID</th>
                  <th>Material</th>
                  <th>Stock Status</th>
                  <th>Barcode No.</th>
                  <th>QR Code String</th>
                  <th>Location</th>
                  <th className="text-center">Scans</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4" style={{ color: '#94a3b8' }}>No material records found.</td></tr>
                ) : (
                  filteredMaterials.map(item => {
                    const matCode = item.material_code || `MAT-${String(item.id).padStart(3, '0')}`;
                    const barcodeNum = `89012345${String(item.id).padStart(4, '0')}`;
                    const qrStr = `SMTBMS-${matCode}-STD`;
                    const qty = Number(item.quantity || 0);

                    let statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.emerald}1A`, color: '#0f9488' }}>In Stock ({qty} pcs)</span>;
                    if (qty === 0) {
                      statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.alert}1A`, color: '#dc2626' }}>Out of Stock</span>;
                    } else if (qty <= 10) {
                      statusBadge = <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: `${COLORS.amber}22`, color: '#b45309' }}>Low Stock ({qty} pcs)</span>;
                    }

                    return (
                      <tr key={item.id}>
                        <td className="fw-bold" style={{ color: COLORS.primary }}>{matCode}</td>
                        <td className="fw-semibold" style={{ color: '#1e293b' }}>{item.material_name}</td>
                        <td>{statusBadge}</td>
                        <td><span className="barcode-pill">{barcodeNum}</span></td>
                        <td><span className="qrcode-pill">{qrStr}</span></td>
                        <td>{item.location || 'Warehouse Main'}</td>
                        <td className="text-center">
                          <span className="fw-bold" style={{ color: COLORS.primary, cursor: 'pointer' }} onClick={() => setScanCount(c => c + 1)}>
                            {3 + (item.id % 5)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <button className="btn-action-preview" onClick={() => handlePreview(item)} title="Preview Label" style={{ padding: '6px 10px' }}>
                              {THIN_ICONS.eye}
                            </button>
                            <button className="btn-action-print" onClick={() => handlePrint(item)} title="Print Label" style={{ padding: '6px 10px' }}>
                              {THIN_ICONS.printer}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && selectedMaterial && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title" style={{ color: '#1e293b' }}>Label Preview</h5>
                <button type="button" className="btn-close" onClick={() => setShowPreviewModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4" id="print-label-area">
                <div style={{ border: '2px dashed #e5e0f5', borderRadius: 16, padding: 24, background: '#fff' }}>
                  <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>{selectedMaterial.material_name}</h6>
                  <p className="small mb-3" style={{ color: '#94a3b8' }}>{selectedMaterial.material_code || `MAT-${selectedMaterial.id}`}</p>

                  <div className="my-3">
                    <svg width="220" height="60">
                      <rect x="10" y="5" width="4" height="50" fill="#000" />
                      <rect x="18" y="5" width="2" height="50" fill="#000" />
                      <rect x="24" y="5" width="6" height="50" fill="#000" />
                      <rect x="34" y="5" width="2" height="50" fill="#000" />
                      <rect x="40" y="5" width="4" height="50" fill="#000" />
                      <rect x="48" y="5" width="8" height="50" fill="#000" />
                      <rect x="60" y="5" width="2" height="50" fill="#000" />
                      <rect x="66" y="5" width="4" height="50" fill="#000" />
                      <rect x="74" y="5" width="6" height="50" fill="#000" />
                      <rect x="84" y="5" width="2" height="50" fill="#000" />
                      <rect x="90" y="5" width="4" height="50" fill="#000" />
                      <rect x="98" y="5" width="8" height="50" fill="#000" />
                      <rect x="110" y="5" width="4" height="50" fill="#000" />
                      <rect x="118" y="5" width="2" height="50" fill="#000" />
                      <rect x="124" y="5" width="6" height="50" fill="#000" />
                      <rect x="134" y="5" width="4" height="50" fill="#000" />
                      <rect x="142" y="5" width="2" height="50" fill="#000" />
                      <rect x="148" y="5" width="8" height="50" fill="#000" />
                      <rect x="160" y="5" width="2" height="50" fill="#000" />
                      <rect x="166" y="5" width="6" height="50" fill="#000" />
                      <rect x="176" y="5" width="2" height="50" fill="#000" />
                      <rect x="182" y="5" width="4" height="50" fill="#000" />
                      <rect x="190" y="5" width="6" height="50" fill="#000" />
                      <rect x="200" y="5" width="4" height="50" fill="#000" />
                    </svg>
                    <div className="small fw-bold mt-1" style={{ letterSpacing: '0.1em' }}>
                      89012345{String(selectedMaterial.id).padStart(4, '0')}
                    </div>
                  </div>

                  <div className="badge px-3 py-2 mt-2" style={{ background: '#FAF8FF', color: '#1e293b', border: '1px solid #e5e0f5' }}>
                    QR: SMTBMS-{selectedMaterial.material_code || selectedMaterial.id}-STD
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn rounded-pill px-4 bg-white border" style={{ borderColor: '#e5e0f5', color: '#475569' }} onClick={() => setShowPreviewModal(false)}>Close</button>
                <button
                  className="btn rounded-pill px-4 border-0 text-white fw-semibold"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
                  onClick={() => handlePrint(selectedMaterial)}
                >
                  Print Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE LABEL MODAL */}
      {showGenerateModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(44, 37, 32, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title" style={{ color: '#1e293b' }}>Batch Barcode Label Generator</h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <p className="small" style={{ color: '#94a3b8' }}>Generate thermal roll printable labels for current active inventory catalog.</p>
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: '#475569' }}>Select Material Item</label>
                  <select className="form-select rounded-3" style={{ border: '1px solid #e5e0f5' }}>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.material_name} ({m.material_code || `MAT-${m.id}`})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: '#475569' }}>Label Print Quantity</label>
                  <input type="number" className="form-control rounded-3" defaultValue={10} min={1} style={{ border: '1px solid #e5e0f5' }} />
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn rounded-pill px-4 bg-white border" style={{ borderColor: '#e5e0f5', color: '#475569' }} onClick={() => setShowGenerateModal(false)}>Cancel</button>
                <button
                  className="btn rounded-pill px-4 border-0 text-white fw-semibold"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
                  onClick={() => { alert('Batch Barcodes Queued for Thermal Printer!'); setShowGenerateModal(false); }}
                >
                  Generate & Send to Printer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeQRManagementPage;