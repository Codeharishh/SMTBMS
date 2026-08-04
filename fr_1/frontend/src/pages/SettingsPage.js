// src/pages/SettingsPage.js
import React, { useState, useRef } from 'react';
import { getCurrentUser } from '../utils/authHelpers';

// ── UNIFIED PRODUCTION PALETTE MATRIX (Matching MaterialsPage.js) ───────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#FF7A45',
  alert: '#FF6B6B'
};

// ── CRISP-OPTIMIZED VECTOR SVG MATRIX FOR SETTINGS CONTROLS ────────────────
const THIN_ICONS = {
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="7" r="4" />
    </svg>
  ),
  userCheck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle vectorEffect="non-scaling-stroke" cx="8.5" cy="7" r="4" />
      <polyline vectorEffect="non-scaling-stroke" points="17 11 19 13 23 9" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  crown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path vectorEffect="non-scaling-stroke" d="M3 20h18" />
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline vectorEffect="non-scaling-stroke" points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect vectorEffect="non-scaling-stroke" x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line vectorEffect="non-scaling-stroke" x1="16" y1="2" x2="16" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="8" y1="2" x2="8" y2="6" />
      <line vectorEffect="non-scaling-stroke" x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polygon vectorEffect="non-scaling-stroke" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  camera: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path vectorEffect="non-scaling-stroke" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="13" r="4" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <polyline vectorEffect="non-scaling-stroke" points="20 6 9 17 4 12" />
    </svg>
  ),
  settingsGear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="3" />
      <path vectorEffect="non-scaling-stroke" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

const SettingsPage = () => {
  const user = getCurrentUser() || {};
  const currentRole = user.role || 'User';
  const displayName = user.name || 'User Name';
  const emailAddr = user.email || 'user@smtbms.com';
  const currentDept = user.department || 'General';

  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80');

  const [form, setForm] = useState({
    fullName: displayName,
    email: emailAddr,
    phone: '+91 98765 43210',
    department: currentDept,
    designation: currentRole,
    location: 'Mumbai, India',
    bio: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setAvatarUrl(newUrl);
      setSuccessMsg('Profile picture updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Personal information updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 600);
  };

  return (
    <div className="theme-settings container-fluid px-4 py-4" style={{
      background: 'linear-gradient(160deg, #F5F2FF 0%, #FDF0F2 45%, #FFF7EC 100%)',
      minHeight: '100vh', color: '#1e293b', fontFamily: '"Inter", sans-serif'
    }}>

      {/* CORE CSS MICRO-SURFACE HOVER & SELECTION ACCENTS */}
      <style>{`
        /* Premium Card Configurations */
        .premium-card-lux {
          background: #ffffff !important;
          border: none !important;
          border-radius: 22px !important;
          box-shadow: 0 8px 24px rgba(31, 41, 55, 0.05) !important;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
        }
        .premium-card-lux:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(31, 41, 55, 0.08) !important;
        }

        /* Input Controls */
        .theme-settings .form-control-lux {
          background-color: #FAF8FF !important;
          border: 1px solid #e5e0f5 !important;
          border-radius: 12px !important;
          padding: 10px 14px !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          transition: all 0.2s ease !important;
        }
        .theme-settings .form-control-lux:focus {
          outline: none !important;
          background-color: #ffffff !important;
          border-color: ${COLORS.indigo} !important;
          box-shadow: 0 0 0 3px ${COLORS.indigo}1A !important;
        }

        .hover-btn-lux {
          transition: all 0.2s ease !important;
        }
        .hover-btn-lux:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(91, 141, 239, 0.28) !important;
        }
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;
        }
      `}</style>

      {/* MATCHED MODERN NAVIGATION HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4 pt-2 border-bottom pb-3" style={{ borderColor: '#e5e0f5' }}>
        <div className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
          style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '14px' }}>
          {THIN_ICONS.settingsGear}
        </div>
        <div className="d-flex flex-column justify-content-center">
          <h3 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>System Settings</h3>
          <p style={{ color: '#94a3b8' }} className="small mb-0">Manage profile personal information, account summary, and activity statistics.</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 rounded-4 shadow-sm fw-bold mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
          {THIN_ICONS.checkCircle} {successMsg}
        </div>
      )}

      {/* MAIN TWO-COLUMN PROFILE & ACCOUNT SUMMARY LAYOUT */}
      <div className="row g-4">

        {/* LEFT COLUMN: PERSONAL INFORMATION & PROFILE EDIT */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 premium-card-lux p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: '#ffffff', color: COLORS.indigo,
                  border: `2px solid ${COLORS.indigo}33`
                }}>
                {THIN_ICONS.userCheck}
              </div>
              <h5 className="fw-bold text-dark mb-0">Personal Information</h5>
            </div>

            {/* AVATAR HERO BANNER */}
            <div className="p-4 rounded-4 mb-4 d-flex align-items-center gap-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '1px solid #C7D2FE' }}>
              <div className="position-relative">
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="rounded-4 object-fit-cover shadow-sm"
                  style={{ width: '84px', height: '84px', border: '3px solid #ffffff' }}
                />
                <span className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '22px', height: '22px', border: '2px solid #ffffff' }}>
                  {THIN_ICONS.check}
                </span>
              </div>
              <div>
                <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{form.fullName}</h4>
                <p className="text-muted small mb-2">{form.designation} · {form.department}</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="btn text-white rounded-3 px-3 py-1.5 small fw-bold d-inline-flex align-items-center gap-2 border-0 shadow-sm hover-btn-lux"
                  style={{ background: `linear-gradient(135deg, ${COLORS.indigo} 0%, #818CF8 100%)` }}
                >
                  {THIN_ICONS.camera} Change Photo
                </button>
              </div>
            </div>

            {/* PERSONAL INFORMATION FORM */}
            <form onSubmit={handleSave}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>FULL NAME</label>
                  <input
                    type="text"
                    className="form-control form-control-lux"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="form-control form-control-lux"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>PHONE</label>
                  <input
                    type="text"
                    className="form-control form-control-lux"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>DEPARTMENT</label>
                  <input
                    type="text"
                    className="form-control form-control-lux"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>DESIGNATION</label>
                  <input
                    type="text"
                    className="form-control form-control-lux"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>LOCATION</label>
                  <input
                    type="text"
                    className="form-control form-control-lux"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase" style={{ fontSize: '0.72rem', color: '#64748b' }}>BIO</label>
                <textarea
                  className="form-control form-control-lux"
                  rows="3"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn text-white rounded-3 px-4 py-2.5 fw-bold hover-btn-lux border-0 shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #FFA36C 100%)` }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT SUMMARY & ACTIVITY STATS */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">

            {/* ACCOUNT SUMMARY CARD */}
            <div className="card border-0 premium-card-lux p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#ffffff', color: COLORS.violet,
                    border: `2px solid ${COLORS.violet}33`
                  }}>
                  {THIN_ICONS.shield}
                </div>
                <h5 className="fw-bold text-dark mb-0">Account Summary</h5>
              </div>

              <div className="d-flex flex-column gap-3">
                {/* ROLE */}
                <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: '#D97706' }}>
                    {THIN_ICONS.crown}
                    <span className="fw-bold small">Department</span>
                  </div>
                  <span className="fw-extrabold" style={{ color: '#D97706' }}>{form.department || currentDept}</span>
                </div>

                {/* ACCESS LEVEL */}
                <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: COLORS.violet }}>
                    {THIN_ICONS.shield}
                    <span className="fw-bold small">Access Level</span>
                  </div>
                  <span className="fw-extrabold" style={{ color: COLORS.violet }}>{form.designation || currentRole}</span>
                </div>

                {/* STATUS */}
                <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: '#059669' }}>
                    {THIN_ICONS.checkCircle}
                    <span className="fw-bold small">Status</span>
                  </div>
                  <span className="fw-extrabold" style={{ color: '#059669' }}>Active</span>
                </div>

                {/* MEMBER SINCE */}
                <div className="p-3 rounded-4 d-flex align-items-center justify-content-between" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: '#0284C7' }}>
                    {THIN_ICONS.calendar}
                    <span className="fw-bold small">Member Since</span>
                  </div>
                  <span className="fw-extrabold" style={{ color: '#0284C7' }}>Jan 2024</span>
                </div>
              </div>
            </div>

            {/* ACTIVITY STATS CARD */}
            <div className="card border-0 premium-card-lux p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#ffffff', color: COLORS.amber,
                    border: `2px solid ${COLORS.amber}33`
                  }}>
                  {THIN_ICONS.zap}
                </div>
                <h5 className="fw-bold text-dark mb-0">Activity Stats</h5>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-muted">Actions this week</span>
                  <span className="fw-extrabold text-dark">47</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#F1F5F9' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '85%', background: `linear-gradient(90deg, ${COLORS.amber} 0%, #FBBF24 100%)`, borderRadius: '10px' }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-muted">Reports generated</span>
                  <span className="fw-extrabold text-dark">12</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#F1F5F9' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: '60%', background: `linear-gradient(90deg, ${COLORS.indigo} 0%, ${COLORS.sky} 100%)`, borderRadius: '10px' }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;