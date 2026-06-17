// src/pages/VendorsPage.js
import React, { useEffect, useState } from 'react';
import { fetchVendors, createVendor } from '../services/vendorService';

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    rating: '',
    status: 'active'
  });

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    try {
      const data = await fetchVendors();
      setVendors(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVendor(formData);
      alert('Vendor added successfully');
      setFormData({
        vendor_name: '', contact_person: '', email: '', phone: '', address: '',
        category: '', rating: '', status: 'active'
      });
      loadVendors();
    } catch (error) { console.error(error); }
  };

  const filteredVendors = vendors.filter((vendor) =>
    (vendor.vendor_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    // 🟢 ENHANCED LIGHT MODE WRAPPER BACKGROUND CANVAS
    <div className="theme-erp container-fluid px-4 py-3" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>

      {/* 🟢 RE-ENGINEERED HIGH-CONTRAST LIGHT ACCENT STYLE RULES */}
      <style>{`
        .hover-premium-card {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease-in-out !important;
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
        }
        .hover-premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05) !important;
          border-color: #cbd5e1 !important;
        }
        .hover-row-lux {
          transition: background-color 0.2s ease !important;
        }
        .hover-row-lux:hover {
          background-color: #f8fafc !important;
        }
        .hover-input-lux {
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          border: 1px solid #cbd5e1 !important;
          background-color: #ffffff !important;
          color: #1e293b !important;
          padding: 10px 14px;
        }
        .hover-input-lux:focus, .hover-input-lux:hover {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
          background-color: #ffffff !important;
          outline: none;
        }
        .hover-scale-action {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          border: none !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important;
        }
        .hover-scale-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
          filter: brightness(1.04);
        }
        .light-table-head th {
          background-color: #f1f5f9 !important;
          color: #475569 !important;
          font-weight: 700 !important;
          font-size: 0.78rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.6px !important;
          border-bottom: 2px solid #cbd5e1 !important;
          padding: 14px !important;
        }
        .light-table-body td {
          color: #334155 !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 14px !important;
        }
      `}</style>

      {/* HEADER BLOCK */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: '#e2e8f0' }}>
        <div>
          <h3 className="fw-bold mb-0 text-dark">Vendors Dashboard</h3>
          <p style={{ color: '#64748b' }} className="mb-0 small">Manage supplier registries and structural vendor relationship indexes.</p>
        </div>
      </div>

      {/* ADD VENDOR FORM */}
      <div className="card border-0 shadow-sm p-4 mb-4 hover-premium-card">
        <h5 className="fw-bold mb-3 text-dark">Add New Vendor Profile</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {[
              { name: 'vendor_name', placeholder: 'Vendor Name *', type: 'text', req: true },
              { name: 'contact_person', placeholder: 'Contact Person', type: 'text' },
              { name: 'email', placeholder: 'Email Address', type: 'email' },
              { name: 'phone', placeholder: 'Phone Route', type: 'text' },
              { name: 'address', placeholder: 'Physical Address', type: 'text' },
              { name: 'category', placeholder: 'Supply Classification', type: 'text' },
              { name: 'rating', placeholder: 'Performance Score (0-5)', type: 'number', step: '0.1' }
            ].map((field) => (
              <div className="col-md-4" key={field.name}>
                <input
                  type={field.type}
                  step={field.step}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="form-control hover-input-lux rounded-3"
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.req}
                />
              </div>
            ))}

            <div className="col-md-4">
              <select name="status" className="form-select hover-input-lux rounded-3" value={formData.status} onChange={handleChange} style={{ cursor: 'pointer' }}>
                <option value="active">Active System Node</option>
                <option value="inactive">Inactive System Node</option>
              </select>
            </div>

            <div className="col-12 mt-3">
              <button className="btn text-white px-4 py-2.5 fw-semibold hover-scale-action rounded-3">Add Vendor Parameters</button>
            </div>
          </div>
        </form>
      </div>

      {/* VENDOR LIST TABLE CONTAINER */}
      <div className="card border-0 shadow-sm p-4 hover-premium-card">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          <h5 className="fw-bold mb-0 text-dark">Vendor Operational Directory</h5>
          <input
            type="text"
            placeholder="Search vendor parameters..."
            className="form-control hover-input-lux rounded-pill ps-4 w-100"
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0 border rounded-3 overflow-hidden matrix-table" style={{ borderColor: '#cbd5e1' }}>
            <thead className="light-table-head">
              <tr className="text-uppercase tracking-wider fw-bold">
                <th className="ps-4 py-3 border-0">Vendor Entity</th>
                <th className="border-0">Contact Node</th>
                <th className="border-0">Classification</th>
                <th className="border-0">Rating Index</th>
                <th className="border-0 text-end pe-4">Status Flag</th>
              </tr>
            </thead>
            <tbody className="light-table-body">
              {filteredVendors.length ? (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover-row-lux">
                    <td className="ps-4 py-3">
                      <strong className="text-dark">{vendor.vendor_name}</strong>
                      <div style={{ color: '#64748b' }} className="small font-monospace mt-0.5">{vendor.email || 'no-email@linked.net'}</div>
                    </td>
                    <td className="text-dark">
                      {vendor.contact_person || '—'}
                      <div style={{ color: '#64748b' }} className="small font-monospace mt-0.5">{vendor.phone || '—'}</div>
                    </td>
                    <td style={{ color: '#475569' }} className="fw-medium">{vendor.category || 'General Log'}</td>
                    <td className="fw-bold text-dark">⭐ {vendor.rating || 'N/A'}</td>
                    <td className="text-end pe-4">
                      <span className="badge rounded-pill px-3 py-1.5 fw-semibold border" style={
                        vendor.status === 'active'
                          ? { backgroundColor: '#e6f4ea', color: '#137333', borderColor: '#ceead6' }
                          : { backgroundColor: '#fce8e6', color: '#c5221f', borderColor: '#fad2cf' }
                      }>
                        {vendor.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary">
                    <span className="fs-3 d-block mb-2">📁</span>No custom supplier models discovered inside parameters search limits.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;