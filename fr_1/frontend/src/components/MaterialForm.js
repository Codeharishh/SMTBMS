import { useEffect, useState } from 'react';

const defaultState = {
  material_name: '',
  material_code: '',
  category: '',
  quantity: 0,
  supplier: '',
  location: '',
  status: 'Active',
};

const MaterialForm = ({ activeMaterial, onSave, onCancel }) => {
  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (activeMaterial) {
      setFormData({
        material_name: activeMaterial.material_name || '',
        material_code: activeMaterial.material_code || '',
        category: activeMaterial.category || '',
        quantity: activeMaterial.quantity || 0,
        supplier: activeMaterial.supplier || '',
        location: activeMaterial.location || '',
        status: activeMaterial.status || 'Active',
      });
    } else {
      setFormData(defaultState);
    }
  }, [activeMaterial]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div className="card card-custom mb-4">
      <div className="card-body">
        <h5 className="card-title">{activeMaterial ? 'Edit Material' : 'Add New Material'}</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Material Name</label>
            <input name="material_name" className="form-control" value={formData.material_name} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Code</label>
            <input name="material_code" className="form-control" value={formData.material_code} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <input name="category" className="form-control" value={formData.category} onChange={handleChange} required />
          </div>
          <div className="col-md-2">
            <label className="form-label">Quantity</label>
            <input name="quantity" type="number" className="form-control" value={formData.quantity} onChange={handleChange} min="0" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Supplier</label>
            <input name="supplier" className="form-control" value={formData.supplier} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Location</label>
            <input name="location" className="form-control" value={formData.location} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {activeMaterial ? 'Update Material' : 'Add Material'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;
