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
  setSelectedCategory
}) => {

  // 🟢 FIXED: Safe fallbacks prevent crashes when database properties return null or undefined
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      if (!item) return false;

      // Force null/undefined properties to fallback safely to an empty string ''
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

      return matchSearch && matchCategory;
    });
  }, [materials, searchValue, selectedCategory]);

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
        .hover-scale-action {
          transition: transform 0.2s ease, filter 0.2s ease !important;
        }
        .hover-scale-action:hover {
          transform: scale(1.03);
          filter: brightness(1.05);
        }
      `}</style>

      {/* FILTER SEARCH AND CONTROLS ROW */}
      <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
        <div className="position-relative flex-grow-1" style={{ maxWidth: '280px' }}>
          <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ zIndex: 5 }}>🔍</span>
          <input
            type="text"
            className="form-control hover-input-lux ps-5 small"
            placeholder="Search materials..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ borderRadius: '12px', padding: '0.6rem 1rem' }}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
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
              <th className="text-end pe-4 border-0">Actions</th>
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
                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-dark hover-scale-action rounded-3 px-2.5 small fw-semibold"
                          onClick={() => onEdit(material)}
                          style={{ borderColor: 'var(--card-border)', color: 'var(--text)', backgroundColor: 'transparent' }}
                        >
                          ⚙️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger hover-scale-action rounded-3 px-2.5 small fw-semibold"
                          onClick={() => onDelete(material.id)}
                        >
                          🗑️ Delete
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