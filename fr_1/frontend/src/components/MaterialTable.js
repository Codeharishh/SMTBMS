// src/components/MaterialTable.js
import React, { useMemo } from 'react';

const MaterialTable = ({
  materials = [],
  onEdit,
  onDelete,
  searchValue = '',
  setSearchValue,
  categories = [],
  selectedCategory = '',
  setSelectedCategory,
  statusFilter = 'All',
  setStatusFilter
}) => {

  // 🟢 SAFE FILTERING LOGIC
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      if (!item) return false;

      const search = (searchValue || '').toLowerCase();
      const name = (item.material_name || '').toLowerCase();
      const code = (item.material_code || '').toLowerCase();
      const supplier = (item.supplier || '').toLowerCase();
      const location = (item.location || '').toLowerCase();

      const matchSearch =
        name.includes(search) ||
        code.includes(search) ||
        supplier.includes(search) ||
        location.includes(search);

      const matchCategory = selectedCategory ? item.category === selectedCategory : true;

      let matchStatus = true;
      const qty = Number(item.quantity || 0);
      const minQty = Number(item.min_quantity || item.low_stock_threshold || 10);
      const itemStatus = (item.status || '').toLowerCase();

      if (statusFilter === 'In Stock') {
        matchStatus = qty > minQty && !itemStatus.includes('out') && !itemStatus.includes('transit');
      } else if (statusFilter === 'Low Stock') {
        matchStatus = (qty <= minQty && qty > 0) || itemStatus.includes('low');
      } else if (statusFilter === 'Out of Stock') {
        matchStatus = qty === 0 || itemStatus.includes('out');
      }

      return matchSearch && matchCategory && matchStatus;
    });
  }, [materials, searchValue, selectedCategory, statusFilter]);

  return (
    <div className="table-wrapper p-3" style={{ background: 'var(--surface)', borderRadius: '16px' }}>

      {/* MICRO-INTERACTION PREMIUM HOVER STYLE SHEET */}
      <style>{`
        .hover-input-lux {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
          background-color: var(--surface-alt) !important;
          border: 1px solid var(--card-border) !important;
          color: var(--text) !important;
        }
        .hover-input-lux:focus, .hover-input-lux:hover {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.15) !important;
          background-color: var(--surface) !important;
          outline: none;
        }
        .hover-premium-row-lux {
          transition: background-color 0.2s ease, transform 0.15s ease !important;
        }
        .hover-premium-row-lux:hover {
          background-color: var(--surface-alt) !important;
          transform: scale(1.002);
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

      {/* FILTER SEARCH AND CONTROLS ROW */}
      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
        <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
          <div className="position-relative" style={{ minWidth: '240px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}>🔍</span>
            <input
              type="text"
              className="form-control hover-input-lux ps-5 small"
              placeholder="Search material..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ borderRadius: '12px', padding: '0.6rem 1rem' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select hover-input-lux small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ borderRadius: '12px', padding: '0.6rem 1rem' }}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATUS FILTER PILLS MATCHING SCREENSHOT */}
        {setStatusFilter && (
          <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-3 border" style={{ backgroundColor: '#FAF8FF' }}>
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm px-3 py-1.5 rounded-3 fw-bold ${statusFilter === st ? 'btn-primary text-white shadow-sm' : 'text-secondary border-0 bg-transparent'}`}
                style={{ fontSize: '0.78rem' }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RE-STYLED RESPONSIVE TABLE LAYER */}
      <div className="table-responsive rounded-3 border" style={{ borderColor: 'var(--card-border)' }}>
        <table className="table align-middle mb-0">
          <thead style={{ backgroundColor: 'var(--surface-alt)' }}>
            <tr style={{ fontSize: '0.85rem', color: 'var(--muted)', borderColor: 'var(--card-border)' }} className="text-uppercase tracking-wider fw-bold">
              <th className="ps-4 py-3 border-0">Material</th>
              <th className="border-0">Code</th>
              <th className="border-0">Category</th>
              <th className="border-0">Quantity</th>
              <th className="border-0">Supplier</th>
              <th className="border-0">Location</th>
              <th className="border-0">Status</th>
              <th className="text-center border-0">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length ? (
              filteredMaterials.map((material) => {
                const qty = Number(material.quantity || 0);
                const isLowStock = qty <= 10;

                return (
                  <tr
                    key={material.id}
                    className="hover-premium-row-lux"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                    }}
                  >
                    <td className="ps-4 py-3 fw-bold" style={{ color: 'var(--text)' }}>
                      {material.material_name || 'Unnamed Asset Component'}
                    </td>
                    <td className="font-monospace text-uppercase small" style={{ color: 'var(--muted)' }}>
                      {material.material_code || '--'}
                    </td>
                    <td style={{ color: 'var(--text)' }} className="fw-medium">
                      {material.category || 'General'}
                    </td>
                    <td>
                      <span className={`fw-bold ${isLowStock ? 'text-danger' : 'text-dark'}`} style={!isLowStock ? { color: 'var(--text)' } : {}}>
                        {qty.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{material.supplier || 'N/A'}</td>
                    <td style={{ color: 'var(--muted)' }} className="small fw-medium">{material.location || 'Unassigned'}</td>
                    <td>
                      <span className="badge px-3 py-1.5 rounded-pill" style={
                        isLowStock ? { backgroundColor: 'rgba(220, 53, 69, 0.12)', color: '#dc3545' } :
                          (material.status || '').toLowerCase().includes('transit') ? { backgroundColor: 'rgba(23, 162, 184, 0.12)', color: '#17a2b8' } :
                            { backgroundColor: 'rgba(40, 167, 69, 0.12)', color: '#28a745' }
                      }>
                        {material.status || (isLowStock ? 'Low Stock' : 'Active')}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        <button
                          className="btn-action-icon edit-icon-btn"
                          onClick={() => onEdit(material)}
                          title="Edit Material"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon del-icon-btn"
                          onClick={() => onDelete(material.id)}
                          title="Delete Material"
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
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-5 shadow-xs" style={{ color: 'var(--muted)', backgroundColor: 'var(--surface)' }}>
                  <span className="fs-3 d-block mb-2">📦</span> No materials matched your query search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialTable;