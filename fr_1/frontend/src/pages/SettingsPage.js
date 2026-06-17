// src/pages/SettingsPage.js
import React from 'react';

const SettingsPage = () => {
  return (
    <div className="theme-admin container-fluid px-4 py-4" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* INTERACTIVE FORM FOCUS ENGINE HOVER ACCENTS */}
      <style>{`
        .premium-card-lux {
          background: #ffffff !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
          border-radius: 18px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015) !important;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s ease-in-out !important;
        }
        .premium-card-lux:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.04) !important;
        }
        .hover-input-lux {
          background-color: #ffffff !important;
          border: 1px solid #ced4da !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-input-lux:hover { border-color: #4f46e5 !important; }
        .hover-input-lux:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15) !important; }
        .hover-btn-lux {
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease !important;
          font-weight: 600 !important;
        }
        .hover-btn-lux:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
          filter: brightness(1.03);
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Workspace Settings</h2>
          <p className="text-muted small mb-0">Manage your profile account preferences, contact routes, and core platform security options.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* ACCOUNT PREFERENCES PROFILE CARD */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 premium-card-lux p-4 bg-white h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="fs-4">👤</span>
              <div>
                <h5 className="fw-bold text-dark mb-0">Account Details</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Update your standard organizational contact records.</p>
              </div>
            </div>

            <hr className="text-black-50 my-3" />

            <div className="mb-3">
              <label className="form-label fw-bold text-secondary small mb-1">Primary Email Address</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem', zIndex: 5 }}>✉️</span>
                <input
                  type="email"
                  className="form-control rounded-3 ps-5 py-2.5 small text-dark hover-input-lux"
                  placeholder="user@company.com"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
              <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>This route handles core system notifications and audit trail tracking log updates.</div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary small mb-1">Mobile Contact Phone</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem', zIndex: 5 }}>📞</span>
                <input
                  type="tel"
                  className="form-control rounded-3 ps-5 py-2.5 small text-dark hover-input-lux"
                  placeholder="(555) 123-4567"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="mt-auto pt-2">
              <button className="btn btn-primary-themed rounded-3 px-4 py-2.5 hover-btn-lux shadow-sm">
                💾 Save Account Profile
              </button>
            </div>
          </div>
        </div>

        {/* SECURITY & CREDENTIALS CONTROLS CARD */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 premium-card-lux p-4 bg-white h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="fs-4">🔒</span>
              <div>
                <h5 className="fw-bold text-dark mb-0">Access & Security</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Modify password tokens to enforce authorization safeguards.</p>
              </div>
            </div>

            <hr className="text-black-50 my-3" />

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary small mb-1">New System Password</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem', zIndex: 5 }}>🔑</span>
                <input
                  type="password"
                  className="form-control rounded-3 ps-5 py-2.5 text-dark hover-input-lux"
                  placeholder="••••••••••••"
                  style={{ fontSize: '0.9rem', letterSpacing: '1.5px' }}
                />
              </div>
              <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>Passwords must satisfy system rules: minimum 8 tokens with mixed alphanumeric markers.</div>
            </div>

            <div className="mt-auto pt-2">
              <button className="btn btn-outline-dark rounded-3 px-4 py-2.5 hover-btn-lux shadow-sm bg-white text-dark">
                🔄 Roll Security Token
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;