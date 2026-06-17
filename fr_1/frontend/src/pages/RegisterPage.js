// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    department: 'Administration',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = await register(formData);
      localStorage.setItem('smtbms_token', data.token);
      localStorage.setItem('smtbms_user', JSON.stringify(data.user));
      setSuccess('Registration successful. Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden" style={{
      background: 'radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 90.2%)',
      backgroundColor: 'var(--bg)',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Floating decorative gradient bubble accents */}
      <div className="position-absolute rounded-circle opacity-20" style={{ top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
      <div className="position-absolute rounded-circle opacity-20" style={{ bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

      <div className="card p-5 border-0 shadow-lg position-relative lux-auth-card" style={{
        width: '520px',
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--card-border) !important',
      }}>
        {/* Top colored accent indicator bar */}
        <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}></div>

        <div className="text-center mb-4 mt-2">
          <span className="fs-1 d-block mb-2">🔐</span>
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Create Account</h3>
          <p className="text-muted small mb-0">Register your core operational profile into the gateway network.</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 p-3 rounded-3 small fw-medium mb-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success border-0 p-3 rounded-3 small fw-medium mb-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-bold text-secondary mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control hover-input-lux text-dark"
                placeholder="e.g. Suresh Kumar"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ fontSize: '0.9rem', borderRadius: '10px' }}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-secondary mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control hover-input-lux text-dark"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ fontSize: '0.9rem', borderRadius: '10px' }}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-secondary mb-1">Account Password *</label>
              <input
                type="password"
                name="password"
                className="form-control hover-input-lux text-dark"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ fontSize: '0.9rem', borderRadius: '10px', letterSpacing: '1.5px' }}
              />
            </div>

            <div className="col-6">
              <label className="form-label small fw-bold text-secondary mb-1">System Role</label>
              <select
                name="role"
                className="form-select hover-input-lux lux-select-trigger text-dark"
                value={formData.role}
                onChange={handleChange}
                style={{ fontSize: '0.9rem', borderRadius: '10px' }}
              >
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label small fw-bold text-secondary mb-1">Department</label>
              <select
                name="department"
                className="form-select hover-input-lux lux-select-trigger text-dark"
                value={formData.department}
                onChange={handleChange}
                required
                style={{ fontSize: '0.9rem', borderRadius: '10px' }}
              >
                <option value="Administration">Administration</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="IT">IT</option>
                <option value="Inventory">Inventory</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="col-12 mb-2">
              <label className="form-label small fw-bold text-secondary mb-1">Mobile Contact Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control hover-input-lux text-dark"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                style={{ fontSize: '0.9rem', borderRadius: '10px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn w-100 mt-4 py-2.5 shadow-sm text-white hover-btn-lux fw-bold" style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '12px'
          }}>
            Register Workspace Profile
          </button>
        </form>

        <p className="mt-4 text-center text-muted small mb-0 fw-medium">
          Already have an account? <Link to="/login" className="ms-1 fw-bold" style={{ color: '#6366f1', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;