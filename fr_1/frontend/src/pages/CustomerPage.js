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
        <div className="theme-crm container-fluid px-4 py-4" style={{
            background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
            minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
        }}>

            {/* HIGH-END INTERACTIVE EFFECTS HOOKS */}
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
                .hover-input-lux {
                    transition: all 0.2s ease !important;
                    background: #ffffff !important;
                    color: #1e293b !important;
                    border: 1px solid rgba(165, 175, 200, 0.25) !important;
                }
                .hover-input-lux:focus {
                    box-shadow: 0 0 0 4px rgba(255, 122, 69, 0.12) !important;
                    outline: none;
                    border-color: #FF7A45 !important;
                }
                .hover-btn-lux {
                    transition: all 0.2s ease !important;
                }
                .hover-btn-lux:hover {
                    filter: brightness(1.05);
                    box-shadow: 0 6px 16px rgba(255, 122, 69, 0.28) !important;
                }
                .theme-crm th {
                    background-color: #FAF8FF !important;
                    color: #94a3b8 !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    font-size: 0.78rem !important;
                    letter-spacing: 0.05em !important;
                    padding: 14px 20px !important;
                    border-bottom: 2px solid #f1f0f9 !important;
                    text-align: left !important;
                }
                .theme-crm td {
                    padding: 16px 20px !important;
                    vertical-align: middle !important;
                    border-bottom: 1px solid #f4f2fb !important;
                    color: #4a5568 !important;
                    font-size: 0.92rem !important;
                    text-align: left !important;
                }
                .theme-crm tbody tr:hover {
                    background-color: #FDFAFF !important;
                }
            `}</style>

            {/* SECTION CONTAINER HEADER */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 pt-2">
                <div>
                    <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Global Accounts Master Ledger</h3>
                    <p style={{ color: '#94a3b8' }} className="small mb-0">Unified customer directory management, contact channels, and geographical routing registries.</p>
                </div>

                {canModify && (
                    <button
                        className="btn px-4 py-2 rounded-3 fw-semibold shadow-sm border-0 hover-btn-lux text-white"
                        style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}
                        onClick={() => { if (showForm) { handleCancel() } else { setShowForm(true) } }}
                    >
                        {showForm ? 'Close Workspace Console' : '➕ Register New Customer'}
                    </button>
                )}
            </div>

            {/* DYNAMIC OPERATION ENTRY FORM */}
            {showForm && canModify && (
                <div className="card border-0 shadow-sm p-4 mb-4 bg-white hover-premium-card" style={{ borderRadius: '22px', borderLeft: '4px solid #FF7A45' }}>
                    <h5 className="fw-bold text-dark mb-1">
                        {editingId ? '🔧 Modify Existing Customer Profile' : '✨ Register New Global Customer Profile'}
                    </h5>
                    <p className="text-muted small mb-3">Ensure values align with database index restrictions before running commits.</p>

                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold text-secondary">Customer Full Name *</label>
                            <input type="text" required className="form-control hover-input-lux" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Acme Buyer Account" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold text-secondary">Primary Email *</label>
                            <input type="email" required className="form-control hover-input-lux" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="billing@domain.com" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold text-secondary">Contact Telephone</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold text-secondary">Organization Brand/Company</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Global Enterprise Networks" />
                        </div>
                        <div className="col-12 col-md-8">
                            <label className="form-label small fw-semibold text-secondary">Physical Dispatch Address</label>
                            <input type="text" className="form-control hover-input-lux" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="456 Logistics Way, Warehouse Row C" />
                        </div>
                        <div className="col-12 d-flex gap-2 justify-content-end mt-3">
                            <button type="button" className="btn btn-light border px-4 rounded-3 text-muted small" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="btn text-white px-4 py-2 rounded-3 fw-bold border-0 hover-btn-lux" style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFA36C 100%)' }}>Commit to SQL Instance</button>
                        </div>
                    </form>
                </div>
            )}

            {/* CORE DATA LEDGER WORKSPACE */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 hover-premium-card" style={{ borderRadius: '22px' }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <div>
                        <h5 className="fw-bold text-dark mb-0">Active Directory Indexes</h5>
                        <p className="text-muted small mb-0">Displaying valid system accounts pulling straight from database queries.</p>
                    </div>

                    <div className="position-relative" style={{ minWidth: '300px' }}>
                        <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔍</span>
                        <input
                            type="text"
                            className="form-control rounded-pill ps-5 bg-white text-dark small hover-input-lux"
                            placeholder="Filter names, companies, emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
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
                                        <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: '#FF7A45' }}></div>
                                        Sifting data indices rows from remote instance pool...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length ? (
                                filteredCustomers.map((cust) => (
                                    <tr key={cust.id}>
                                        <td className="ps-3 text-muted font-monospace small">#{cust.id}</td>
                                        <td className="fw-bold text-dark">{cust.customer_name}</td>
                                        <td className="fw-medium text-secondary small">{cust.company || <span className="text-black-50 italic">Independent Account</span>}</td>
                                        <td className="text-muted small">{cust.email}</td>
                                        <td className="text-dark small font-monospace">{cust.phone || '—'}</td>
                                        <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={cust.address}>{cust.address || '—'}</td>
                                        <td className="text-end pe-3">
                                            <div className="d-flex gap-2 justify-content-end">
                                                {canModify ? (
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill bg-white hover-btn-lux border" style={{ borderColor: 'rgba(91,141,239,0.3)', color: '#5B8DEF' }} onClick={() => handleEditInit(cust)}>
                                                        Edit
                                                    </button>
                                                ) : (
                                                    <span className="text-muted small italic">Read-Only View</span>
                                                )}
                                                {canDelete && (
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill bg-white hover-btn-lux border" style={{ borderColor: 'rgba(244,107,107,0.3)', color: '#FF6B6B' }} onClick={() => handleDeleteRow(cust.id)}>
                                                        Drop
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        📁 No matching customer schema values discovered in lookups.
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