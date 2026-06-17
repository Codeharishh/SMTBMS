// src/pages/MaterialsPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { fetchMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materialService';
import MaterialTable from '../components/MaterialTable';
import MaterialForm from '../components/MaterialForm';
import { Html5QrcodeScanner } from 'html5-qrcode'; // 🟢 Barcode Scanner Import

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // 🟢 Scanner Active State

  // Categories extraction
  const categories = useMemo(() => {
    return Array.from(new Set(materials.map((item) => item.category).filter(Boolean)));
  }, [materials]);

  // Modern UI Analytics Matrix Calculations
  const metrics = useMemo(() => {
    const total = materials.length;
    let inStock = 0;
    let inTransit = 0;
    let lowStock = 0;

    materials.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const minQty = Number(item.min_quantity || item.low_stock_threshold || 10);
      const status = (item.status || '').toLowerCase();

      if (status === 'in transit' || status === 'transit') {
        inTransit += qty;
      } else {
        inStock += qty;
      }

      if (qty <= minQty && status !== 'in transit' && status !== 'transit') {
        lowStock += 1;
      }
    });

    return { total, inStock, inTransit, lowStock };
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

  // 🟢 INITIALIZE WEBCAM SCANNER DIALOG
  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, false);

      scanner.render((decodedText) => {
        // Automatically inject scanned code into search criteria and close reader
        setSearchValue(decodedText);
        setIsScanning(false);
        scanner.clear();
      }, (error) => {
        // Silent catch for scanning frame telemetry
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
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(id);
      await loadMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="theme-materials container-fluid px-4 py-3" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', fontFamily: '"Inter", sans-serif' }}>

      {/* EMBEDDED MODERN DYNAMIC KEYFRAME INTERACTION HOOKS */}
      <style>{`
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
          background-color: var(--surface) !important;
          border: 1px solid var(--card-border) !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(44, 49, 46, 0.08) !important;
        }
        .hover-btn-lux {
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          transform: scale(1.02);
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2) !important;
        }
        .hover-row-lux { 
          transition: background-color 0.2s ease, transform 0.15s ease !important; 
        }
        .hover-row-lux:hover { 
          background-color: var(--surface-alt) !important; 
          transform: scale(1.002); 
        }
        .hover-input-lux {
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          border: 1px solid var(--card-border) !important;
          background-color: var(--surface) !important;
          color: var(--text) !important;
        }
        .hover-input-lux:focus, .hover-input-lux:hover {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.12) !important;
          outline: none;
        }
        .metric-glow-0 { border-left: 5px solid #2d6df5 !important; }
        .metric-glow-1 { border-left: 5px solid #28a745 !important; }
        .metric-glow-2 { border-left: 5px solid #17a2b8 !important; }
        .metric-glow-3 { border-left: 5px solid #dc3545 !important; }
      `}</style>

      {/* MODERN SCREEN HEADER */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ color: 'var(--text) !important' }}>Materials Tracking</h3>
          <p style={{ color: 'var(--muted)' }} className="small mb-0">Manage inventory with real-time tracking, barcode verification, and procurement workflows.</p>
        </div>
        <div className="d-flex gap-2">
          {/* 🟢 BARCODE SCANNER ACTION TRIGGER */}
          <button
            className="btn btn-outline-dark px-3 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
            onClick={() => setIsScanning(!isScanning)}
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
          >
            {isScanning ? '🛑 Stop Scanner' : '📷 Scan QR/Barcode'}
          </button>
          <button
            className="btn text-white px-4 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 border-0 hover-btn-lux"
            onClick={() => setActiveMaterial({})}
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span>➕</span> Add New Material
          </button>
        </div>
      </div>

      {/* 🟢 SCANNER LIVE VIEWPORT AREA */}
      {isScanning && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center mx-auto hover-premium-card" style={{ maxWidth: '500px' }}>
          <h6 className="fw-bold mb-2">Align Barcode / Asset QR Within Camera Window</h6>
          <div id="reader" className="overflow-hidden rounded-3 bg-light"></div>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Items Type', value: metrics.total, sub: 'Unique ledger SKUs', icon: '📦', classIdx: 'metric-glow-0' },
          { label: 'Total Stock Volume', value: metrics.inStock.toLocaleString(), sub: 'Available in warehouse', icon: '🏭', classIdx: 'metric-glow-1' },
          { label: 'Items In Transit', value: metrics.inTransit.toLocaleString(), sub: 'Active cargo shipments', icon: '🚚', classIdx: 'metric-glow-2' },
          { label: 'Low Stock Alerts', value: metrics.lowStock, sub: 'Requires replenishment', icon: '⚠️', classIdx: 'metric-glow-3' }
        ].map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className={`card border-0 shadow-sm rounded-4 h-100 p-3 hover-premium-card ${card.classIdx}`}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-semibold tracking-wider small" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{card.label}</span>
                <span className="fs-4 bg-opacity-10 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg)' }}>{card.icon}</span>
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{card.value}</h3>
              <small style={{ color: 'var(--muted)' }} className="d-block mt-1">{card.sub}</small>
            </div>
          </div>
        ))}
      </div>

      {/* DYNAMIC OPERATION FORM LAYOUT */}
      {activeMaterial && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 border-start border-3 hover-premium-card" style={{ borderColor: 'var(--primary) !important' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{activeMaterial.id ? '🔧 Modify Material Profile' : '✨ Register New Material Entry'}</h5>
            <button className="btn-close" onClick={() => setActiveMaterial(null)} aria-label="Close"></button>
          </div>
          <MaterialForm activeMaterial={activeMaterial} onSave={handleSave} onCancel={() => setActiveMaterial(null)} />
        </div>
      )}

      {/* DATA CONTROLLER WORKSPACE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--card-border)' }}>
        {loading ? (
          <div className="p-5 text-center" style={{ color: 'var(--muted)' }}>
            <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
            Synchronizing live material registries...
          </div>
        ) : (
          <div className="p-1">
            <MaterialTable
              materials={materials}
              onEdit={(item) => setActiveMaterial(item)}
              onDelete={handleDelete}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;