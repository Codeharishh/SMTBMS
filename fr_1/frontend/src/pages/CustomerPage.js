// src/pages/CustomerPage.js
import React, { useEffect, useMemo, useState } from 'react';
import {
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../services/customerService';
import { getCurrentUser } from '../utils/authHelpers';

const CustomerPage = () => {
    const user = getCurrentUser();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form handling state mapped to your MySQL database schema fields
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
    });

    // Verify access privileges matching your Express middleware rules
    const canDelete = user?.role && ['Admin', 'Sales'].includes(user.role);
    const canModify = user?.role && ['Admin', 'Sales', 'Manager'].includes(user.role);

    const loadCustomerDirectory = async () => {
        setLoading(true);
        try {
            const data = await fetchCustomers();
            setCustomers(data || []);
        } catch (error) {
            console.error('Failed to load customers catalog from DB', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomerDirectory();
    }, []);

    // Filter accounts based on text input bounds
    const filteredCustomers = useMemo(() => {
        return customers.filter((cust) => {
            const name = (cust.customer_name || '').toLowerCase();
            const email = (cust.email || '').toLowerCase();
            const company = (cust.company || '').toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term) || email.includes(term) || company.includes(term);
        });
    }, [customers, searchTerm]);

    // Handle Form Submission (Create or Update router redirection)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.email) return;

        try {
            if (editingId) {
                const updatedRow = await updateCustomer(editingId, formData);
                setCustomers(customers.map(c => c.id === editingId ? updatedRow : c));
            } else {
                const newRow = await createCustomer(formData);
                setCustomers([newRow, ...customers]);
            }
            handleCancel();
        } catch (error) {
            console.error('Database write operation breakdown', error);
            alert('Unable to sync records with database profile.');
        }
    };

    const handleEditInit = (customer) => {
        setEditingId(customer.id);
        setFormData({
            customer_name: customer.customer_name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            address: customer.address || ''
        });
        setShowForm(true);
    };

    const handleDeleteRow = async (id) => {
        if (!window.confirm('Are you sure you want to drop this client record permanently from the global ledger?')) return;
        try {
            await deleteCustomer(id);
            setCustomers(customers.filter(c => c.id !== id));
        } catch (error) {
            console.error('Database delete operation failure', error);
            alert('Middleware restriction or server error preventing execution.');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ customer_name: '', email: '', phone: '', company: '', address: '' });
        setShowForm(false);
    };

    return (
        <div className="theme-crm container-fluid px-4 py-3" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

            {/* HIGH-END INTERACTIVE EFFECTS HOOKS */}
            <style>{`
                .hover-premium-card {
                    transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease-in-out !important;
                }
                .hover-premium-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 22px rgba(0,0,0,0.06) !important;
                }
                .hover-row-lux {
                    transition: background-color 0.15s ease, transform 0.15s ease !important;
                }
                .hover-row-lux:hover {
                    background-color: rgba(248, 249, 250, 0.85) !important;
                    transform: scale(1.002);
                }
                .hover-input-lux {
                    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
                }
                .hover-input-lux:focus, .hover-input-lux:hover {
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15) !important;
                    outline: none;
                }
                .hover-btn-lux {
                    transition: transform 0.15s ease, filter 0.15s ease !important;
                }
                .hover-btn-lux:hover {
                    transform: scale(1.02);
                    filter: brightness(1.05);
                }
            `}</style>

            {/* SECTION CONTAINER HEADER */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold text-dark mb-0">Global Accounts Master Ledger</h2>
                    <p className="text-muted small mb-0">Unified customer directory management, contact channels, and geographical routing registries.</p>
                </div>

                {canModify && (
                    <button
                        className="btn btn-primary px-4 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2 border-0 hover-btn-lux"
                        onClick={() => { if (showForm) { handleCancel() } else { setShowForm(true) } }}
                    >
                        {showForm ? 'Close Workspace Console' : '➕ Register New Customer'}
                    </button>
                )}
            </div>

            {/* DYNAMIC OPERATION ENTRY FORM */}
            {showForm && canModify && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-primary border-4 hover-premium-card">
                    <h5 className="fw-bold text-dark mb-1">
                        {editingId ? '🔧 Modify Existing Customer Profile' : '✨ Register New Global Customer Profile'}
                    </h5>
                    <p className="text-muted small mb-3">Ensure values align with database index restrictions before running commits.</p>

                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Customer Full Name *</label>
                            <input type="text" required className="form-control hover-input-lux" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Acme Buyer Account" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Primary Email *</label>
                            <input type="email" required className="form-control hover-input-lux" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="billing@domain.com" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Contact Telephone</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Organization Brand/Company</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Global Enterprise Networks" />
                        </div>
                        <div className="col-12 col-md-8">
                            <label className="form-label small fw-semibold">Physical Dispatch Address</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="456 Logistics Way, Warehouse Row C" />
                        </div>
                        <div className="col-12 d-flex gap-2 justify-content-end mt-3">
                            <button type="button" className="btn btn-light border px-4 rounded-3 text-muted small" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-4 rounded-3 fw-semibold hover-btn-lux">Commit to SQL Instance</button>
                        </div>
                    </form>
                </div>
            )}

            {/* CORE DATA LEDGER WORKSPACE */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 hover-premium-card">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <h5 className="fw-bold text-dark mb-0">Active Directory Indexes</h5>
                        <p className="text-muted small mb-0">Displaying valid system accounts pulling straight from database queries.</p>
                    </div>

                    <div className="position-relative" style={{ minWidth: '300px' }}>
                        <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔍</span>
                        <input
                            type="text"
                            className="form-control rounded-pill border-light shadow-sm ps-5 bg-white text-dark small hover-input-lux"
                            placeholder="Filter names, companies, emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 border border-light rounded-3 overflow-hidden">
                        <thead className="table-light">
                            <tr style={{ fontSize: '0.85rem' }} className="text-uppercase tracking-wider text-muted">
                                <th className="ps-3">ID</th>
                                <th>Client Name</th>
                                <th>Company Account</th>
                                <th>Email Channel</th>
                                <th>Phone Route</th>
                                <th>Dispatch Address</th>
                                <th className="text-end pe-3">Database Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        Sifting data indices rows from remote instance pool...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length ? (
                                filteredCustomers.map((cust) => (
                                    <tr key={cust.id} className="hover-row-lux">
                                        <td className="ps-3 text-muted font-monospace small">#{cust.id}</td>
                                        <td className="fw-bold text-dark">{cust.customer_name}</td>
                                        <td className="fw-medium text-secondary small">{cust.company || <span className="text-black-50 italic">Independent Account</span>}</td>
                                        <td className="text-muted small">{cust.email}</td>
                                        <td className="text-dark small font-monospace">{cust.phone || '—'}</td>
                                        <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={cust.address}>{cust.address || '—'}</td>
                                        <td className="text-end pe-3">
                                            <div className="d-flex gap-1 justify-content-end">
                                                {canModify ? (
                                                    <button className="btn btn-sm btn-outline-secondary rounded-3 px-2.5 py-1 hover-btn-lux" onClick={() => handleEditInit(cust)}>
                                                        ✏️ Edit
                                                    </button>
                                                ) : (
                                                    <span className="text-muted small italic">Read-Only View</span>
                                                )}
                                                {canDelete && (
                                                    <button className="btn btn-sm btn-outline-danger rounded-3 px-2.5 py-1 hover-btn-lux" onClick={() => handleDeleteRow(cust.id)}>
                                                        🗑️ Drop
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5 bg-light-subtle">
                                        📁 No matching customer schema values discovered in standard lookups.
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

export default CustomerPage;