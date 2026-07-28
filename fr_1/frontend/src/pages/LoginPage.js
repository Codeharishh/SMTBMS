// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { login, googleLogin } from '../services/authService';

// ── BRAND PALETTE MATRIX ─────────────────────────────────────────────────
const COLORS = {
  indigo: '#5B8DEF',
  emerald: '#2ED9C3',
  amber: '#FFC542',
  rose: '#FF6B9D',
  sky: '#4FC3F7',
  violet: '#9B7EDE',
  slate: '#64748B',
  primary: '#5B8DEF',
  alert: '#FF6B6B'
};

// ── CRISP-OPTIMIZED STRIPPED VECTOR SVG GLYPH MATRIX (Materials/Vendors Style) ──
const BRAND_LOGOS = {
  // Brand Assets
  google: (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  ),
  microsoft: (
    <svg width="15" height="15" viewBox="0 0 23 23">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  ),
  apple: (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="#1e293b">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  ),
  // Dashboard UI Vector Controls
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  alertTriangle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  eye: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  mainLogoHex: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  targetRadar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  // Lower feature icons
  box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 16 12 21 3 16 3 8 12 3 21 8 21 16" />
      <polyline points="3 8 12 13 21 8" />
      <line x1="12" y1="21" x2="12" y2="13" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole] = useState('Sales');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login({ email, password, role: selectedRole, rememberMe });
      localStorage.setItem('smtbms_token', data.token);
      localStorage.setItem('smtbms_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  const handleGoogleLoginSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      try {
        const data = await googleLogin({ token: tokenResponse.access_token, role: selectedRole });
        localStorage.setItem('smtbms_token', data.token);
        localStorage.setItem('smtbms_user', JSON.stringify(data.user));
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Google verification failed.');
      }
    },
    onError: () => setError('Google Sign-In process aborted.'),
  });

  return (
    <div className="container-fluid p-0 overflow-hidden" style={{ height: '100vh', maxHeight: '100vh', fontFamily: '"Inter", sans-serif', background: 'radial-gradient(circle at 40% 30%, #1d4ed8 0%, #0f172a 55%, #090d1f 100%)' }}>

      <style>{`
        .left-branding-pane {
          background: transparent;
          position: relative;
        }
        .bg-mesh-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200') center/cover no-repeat;
          opacity: 0.12;
          mix-blend-mode: overlay;
          z-index: 1;
        }
        .login-card-surface {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(24px);
          border-radius: 22px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
          width: 100%;
          max-width: 400px;
          z-index: 5;
        }
        .input-container-lux {
          position: relative;
          width: 100%;
        }
        .input-container-lux input {
          background-color: #F5F9FF !important;
          border: 1px solid #DCE9FA !important;
          color: #1e293b !important;
          padding: 10px 12px 10px 38px;
          font-size: 0.88rem;
          border-radius: 8px;
          transition: all 0.2s;
          width: 100%;
        }
        .input-container-lux input:focus {
          border-color: ${COLORS.indigo} !important;
          box-shadow: 0 0 0 2px rgba(91, 141, 239, 0.15) !important;
          background-color: #ffffff !important;
          outline: none;
        }
        .btn-blue-submit {
          background: linear-gradient(135deg, ${COLORS.indigo} 0%, #6FA6FF 100%) !important;
          border: none !important;
          color: #ffffff !important;
          border-radius: 10px;
          font-weight: 600;
          padding: 11px;
          font-size: 0.9rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }
        .btn-blue-submit:hover {
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(91, 141, 239, 0.32);
          transform: translateY(-1px);
        }
        .btn-blue-submit:active {
          transform: translateY(0);
        }
        .social-btn-lux {
          border: 1px solid #DCE9FA !important;
          background: #ffffff !important;
          color: #334155 !important;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 8px;
          padding: 9px 10px;
          transition: all 0.2s;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .social-btn-lux:hover {
          background: #F5F9FF !important;
          border-color: ${COLORS.indigo}55 !important;
        }
        .icon-overlay-lux {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 12px;
          color: #64748b;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .toggle-password-lux {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 14px;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          user-select: none;
          transition: color 0.15s ease;
        }
        .toggle-password-lux:hover {
          color: #475569;
        }
        .branding-subtitle-lux {
          color: #cbd5e1 !important; 
          font-size: 0.95rem !important;
          line-height: 1.6 !important;
        }
        .feature-desc-lux {
          color: #7FB6FF !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
        }
      `}</style>

      <div className="row g-0 h-100">

        {/* LEFT BRANDING CONTAINER */}
        <div className="col-12 col-xl-7 d-none d-xl-flex flex-column justify-content-between p-5 left-branding-pane">
          <div className="bg-mesh-overlay"></div>

          <div className="d-flex align-items-center gap-3 z-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: '42px', height: '42px', background: `linear-gradient(135deg, ${COLORS.indigo}, #3b6fd6)` }}>
              {BRAND_LOGOS.mainLogoHex}
            </div>
            <div>
              <h5 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.3px', fontSize: '1.1rem' }}>Smart Material Tracking &</h5>
              <p className="text-white-50 small mb-0" style={{ fontSize: '0.8rem' }}>Business Management System</p>
            </div>
          </div>

          <div className="my-auto ps-4 z-3" style={{ maxWidth: '620px' }}>
            <span className="badge px-3 py-2 mb-3 rounded-pill text-white d-inline-flex align-items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>
              <span style={{ color: COLORS.emerald, display: 'inline-flex' }}>{BRAND_LOGOS.targetRadar}</span> Real-time Tracking Active
            </span>
            <h1 className="text-white fw-bold display-4 lh-1.1 mb-3" style={{ letterSpacing: '-1.5px' }}>
              Manage.<br />Track.<br />Optimize. <span style={{ color: '#7FB6FF' }}>Grow.</span>
            </h1>
            <p className="branding-subtitle-lux mb-0">
              A smart platform to streamline your materials, operations, and business in one place.
            </p>
          </div>

          {/* LOWER FEATURES ROW */}
          <div className="row g-4 z-3 border-top pt-4" style={{ borderColor: 'rgba(91, 141, 239, 0.35)' }}>
            {[
              { icon: BRAND_LOGOS.box, title: 'Tracking', desc: 'Real-time visibility' },
              { icon: BRAND_LOGOS.chart, title: 'Insights', desc: 'Data decisions' },
              { icon: BRAND_LOGOS.settings, title: 'Efficiency', desc: 'Automations' },
              { icon: BRAND_LOGOS.shield, title: 'Secure', desc: 'Reliable backend' }
            ].map((feat, idx) => (
              <div key={idx} className="col-3">
                <div className="text-start text-white">
                  <div className="mb-2" style={{ color: COLORS.indigo }}>{feat.icon}</div>
                  <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem' }}>{feat.title}</h6>
                  <small className="feature-desc-lux">{feat.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT LOGIN FORM COLUMN */}
        <div className="col-12 col-xl-5 d-flex align-items-center justify-content-center p-3 h-100">

          <div className="login-card-surface p-4">

            <div className="text-center mb-4">
              <h3 className="fw-black mb-1.5" style={{ color: COLORS.indigo, fontWeight: '900', fontSize: '1.65rem', letterSpacing: '-0.5px' }}>Welcome Back</h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Sign in to access your workspace</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 p-2 rounded-3 small fw-medium mb-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.82rem' }}>
                <span style={{ display: 'inline-flex' }}>{BRAND_LOGOS.alertTriangle}</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="form-label text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.3px' }}>Email Address</label>
                <div className="input-container-lux">
                  <div className="icon-overlay-lux">{BRAND_LOGOS.email}</div>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="form-label text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.3px' }}>Password</label>
                <div className="input-container-lux">
                  <div className="icon-overlay-lux">{BRAND_LOGOS.lock}</div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingRight: '42px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <div
                    className="toggle-password-lux"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? BRAND_LOGOS.eyeOff : BRAND_LOGOS.eye}
                  </div>
                </div>
              </div>

              {/* REMEMBER & FORGOT ACTIONS */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="form-check d-flex align-items-center gap-2 m-0">
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    id="rememberCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: COLORS.indigo, cursor: 'pointer', width: '14px', height: '14px' }}
                  />
                  <label className="form-check-label text-muted fw-medium p-0" htmlFor="rememberCheck" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.82rem', lineHeight: '1' }}>
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" style={{ color: COLORS.indigo, fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* SUBMIT */}
              <button type="submit" className="btn btn-blue-submit shadow-sm mb-4">
                Sign In →
              </button>
            </form>

            {/* SEPARATOR */}
            <div className="d-flex align-items-center mb-4">
              <hr className="flex-grow-1 text-muted opacity-25 m-0" />
              <span className="px-2 text-uppercase text-muted fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>or continue with</span>
              <hr className="flex-grow-1 text-muted opacity-25 m-0" />
            </div>

            {/* OAUTH GRID */}
            <div className="row g-2 mb-2">
              <div className="col-4">
                <button type="button" onClick={() => handleGoogleLoginSuccess()} className="btn social-btn-lux">
                  {BRAND_LOGOS.google}
                  Google
                </button>
              </div>
              <div className="col-4">
                <button type="button" onClick={() => alert('Microsoft integration placeholder active')} className="btn social-btn-lux">
                  {BRAND_LOGOS.microsoft}
                  Microsoft
                </button>
              </div>
              <div className="col-4">
                <button type="button" onClick={() => alert('Apple integration placeholder active')} className="btn social-btn-lux">
                  {BRAND_LOGOS.apple}
                  Apple
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;