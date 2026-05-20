import { useMemo } from 'react';

const MaterialTable = ({ materials, onEdit, onDelete, searchValue, setSearchValue, categories, selectedCategory, setSelectedCategory }) => {
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const search = searchValue.toLowerCase();
      const matchSearch =
        item.material_name.toLowerCase().includes(search) ||
        item.material_code.toLowerCase().includes(search) ||
        item.supplier.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search);
      const matchCategory = selectedCategory ? item.category === selectedCategory : true;
      return matchSearch && matchCategory;
    });
  }, [materials, searchValue, selectedCategory]);

  return (
    <div className="table-wrapper">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <input
          className="form-control me-2"
          placeholder="Search materials"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ maxWidth: '260px' }}
        />
        <select className="form-select me-auto" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Material</th>
              <th>Code</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id} className={material.quantity <= 10 ? 'table-warning' : ''}>
                <td>{material.material_name}</td>
                <td>{material.material_code}</td>
                <td>{material.category}</td>
                <td>{material.quantity}</td>
                <td>{material.supplier}</td>
                <td>{material.location}</td>
                <td>{material.status}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(material)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(material.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!filteredMaterials.length && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  No materials found for this filter.
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
