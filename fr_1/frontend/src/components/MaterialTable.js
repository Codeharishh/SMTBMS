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
    <div className="card border-0 shadow-sm overflow-hidden hover-premium-card" style={{ backgroundColor: '#ffffff', borderRadius: '22px' }}>
      <div className="p-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Material Inventory</h5>
          <p className="small text-muted mb-0">Track stock levels and warehouse distribution metrics</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="position-relative" style={{ minWidth: '220px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                <circle vectorEffect="non-scaling-stroke" cx="11" cy="11" r="8" />
                <line vectorEffect="non-scaling-stroke" x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="form-control rounded-pill ps-5 small"
              placeholder="Search material..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5' }}
            />
          </div>

          <div style={{ minWidth: '150px', position: 'relative' }}>
            <select
              className="form-select rounded-pill small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: '#FAF8FF', border: '1px solid #e5e0f5', appearance: 'none', paddingRight: '30px', cursor: 'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(st => (
            <button
              key={st}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${statusFilter === st ? 'text-white' : 'bg-light text-dark'}`}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? `linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)` : undefined,
                border: statusFilter === st ? '1px solid transparent' : '1px solid #cbd5e1'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* RE-STYLED RESPONSIVE TABLE LAYER */}
      <div className="table-responsive p-4 pt-2">
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