import { useEffect, useState } from 'react';

const COLORS = {
  primary: '#FF7A45',
  slate: '#64748B'
};

const MaterialForm = ({ activeMaterial, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    material_code: '',
    material_name: '',
    category: 'Metal',
    quantity: 0,
    unit: 'pcs',
    supplier: '',
    location: 'Warehouse A',
    status: 'In Stock',
    reorder_level: 0
  });

  useEffect(() => {
    if (activeMaterial && activeMaterial.id) {
      setFormData({
        material_code: activeMaterial.material_code || '',
        material_name: activeMaterial.material_name || '',
        category: activeMaterial.category || 'Metal',
        quantity: activeMaterial.quantity || 0,
        unit: activeMaterial.unit || 'pcs',
        supplier: activeMaterial.supplier || '',
        location: activeMaterial.location || 'Warehouse A',
        status: activeMaterial.status || 'In Stock',
        reorder_level: activeMaterial.min_quantity || activeMaterial.reorder_level || 0
      });
    } else {
      // Auto generate ID like MAT-007
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        material_code: `MAT-${randomNum}`,
        material_name: '',
        category: 'Metal',
        quantity: 0,
        unit: 'pcs',
        supplier: '',
        location: 'Warehouse A',
        status: 'In Stock',
        reorder_level: 10
      });
    }
  }, [activeMaterial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'reorder_level') ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <style>{`
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

      <div className="row g-3">
        {/* MATERIAL ID */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">MATERIAL ID (AUTO-GENERATED — YOU CAN EDIT IT)</label>
          <input
            type="text"
            name="material_code"
            className="form-control modal-input-lux font-monospace text-primary fw-bold"
            value={formData.material_code}
            onChange={handleChange}
            required
          />
        </div>

        {/* MATERIAL NAME */}
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

        {/* CATEGORY */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">CATEGORY</label>
          <select
            name="category"
            className="form-select modal-input-lux"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Metal">Metal</option>
            <option value="Construction">Construction</option>
            <option value="Hardware">Hardware</option>
            <option value="Pipes & Fittings">Pipes & Fittings</option>
            <option value="Electrical">Electrical</option>
          </select>
        </div>

        {/* QUANTITY */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">QUANTITY *</label>
          <input
            type="number"
            name="quantity"
            className="form-control modal-input-lux"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        {/* UNIT */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">UNIT</label>
          <select
            name="unit"
            className="form-select modal-input-lux"
            value={formData.unit}
            onChange={handleChange}
          >
            <option value="pcs">pcs</option>
            <option value="sheets">sheets</option>
            <option value="kg">kg</option>
            <option value="meters">meters</option>
            <option value="boxes">boxes</option>
          </select>
        </div>

        {/* SUPPLIER */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">SUPPLIER</label>
          <input
            type="text"
            name="supplier"
            className="form-control modal-input-lux"
            placeholder="e.g. Apex Steel Ltd"
            value={formData.supplier}
            onChange={handleChange}
          />
        </div>

        {/* LOCATION */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">LOCATION</label>
          <select
            name="location"
            className="form-select modal-input-lux"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="Warehouse A">Warehouse A</option>
            <option value="Warehouse B">Warehouse B</option>
            <option value="Central Yard">Central Yard</option>
          </select>
        </div>

        {/* STATUS */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">STATUS</label>
          <select
            name="status"
            className="form-select modal-input-lux"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="In Transit">In Transit</option>
          </select>
        </div>

        {/* REORDER LEVEL */}
        <div className="col-12 col-md-6">
          <label className="modal-label-lux">REORDER LEVEL</label>
          <input
            type="number"
            name="reorder_level"
            className="form-control modal-input-lux"
            value={formData.reorder_level}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      {/* FORM ACTION BUTTONS MATCHING REFERENCE DESIGN */}
      <div className="row g-3 mt-4 pt-2">
        <div className="col-12 col-md-6">
          <button
            type="submit"
            className="btn w-100 py-2.5 rounded-3 fw-bold text-white border-0 shadow-sm hover-btn-lux"
            style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}
          >
            {activeMaterial && activeMaterial.id ? 'Save Changes' : 'Add Material'}
          </button>
        </div>
        <div className="col-12 col-md-6">
          <button
            type="button"
            className="btn w-100 py-2.5 rounded-3 fw-bold border-0"
            style={{ background: '#F1F5F9', color: '#475569' }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default MaterialForm;
