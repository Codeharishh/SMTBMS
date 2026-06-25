// LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; // 🟢 Added Google Hook
import { login, googleLogin } from '../services/authService'; // 🟢 Added googleLogin Service Hook

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Sales'); // Defaulting to Sales like image_15d5a5.jpg
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Roles dataset to mirror image_15d5a5.jpg selection panels
  const roles = [
    { id: 'Admin', label: 'Admin', icon: '🛡️' },
    { id: 'HR', label: 'HR', icon: '👥' },
    { id: 'Manager', label: 'Manager', icon: '💻' },
    { id: 'Employee', label: 'Employee', icon: '👤' },
    { id: 'Sales', label: 'Sales', icon: '📈' }
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      // 🟢 Enriched request package passing selected backend target role
      const data = await login({ email, password, role: selectedRole, rememberMe });
      localStorage.setItem('smtbms_token', data.token);
      localStorage.setItem('smtbms_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  // GOOGLE AUTHENTICATION CLIENT INTERCEPTOR
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
    <div className="container-fluid p-0 overflow-hidden" style={{ minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#090d1f' }}>

      {/* 🟢 STYLE OVERRIDES FOR EXACT MATCHING MATRICES */}
      <style>{`
        .left-branding-pane {
          background: radial-gradient(circle at 80% 20%, #0c2066 0%, #030712 100%);
          position: relative;
        }
        .bg-mesh-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200') center/cover no-repeat;
          opacity: 0.08;
          mix-blend-mode: overlay;
          z-index: 1;
        }
        .role-btn-lux {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 10px 6px;
          transition: all 0.25s ease;
          position: relative;
          min-width: 68px;
        }
        .role-btn-lux:hover {
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        .role-btn-lux.active {
          border-color: #ea580c !important;
          background-color: #fff7ed !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }
        .role-badge-check {
          position: absolute;
          top: -4px; right: -4px;
          background: #ea580c;
          color: white;
          border-radius: 50%;
          width: 14px; height: 14px;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-card-surface {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 460px;
          z-index: 5;
        }
        .input-container-lux {
          position: relative;
        }
        .input-container-lux input {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #1e293b !important;
          padding-top: 12px;
          padding-bottom: 12px;
          transition: all 0.2s;
        }
        .input-container-lux input:focus {
          border-color: #ea580c !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12) !important;
          background-color: #ffffff !important;
        }
        .btn-orange-submit {
          background: #ea580c !important;
          border: none !important;
          color: #ffffff !important;
          border-radius: 12px;
          font-weight: 600;
          padding-top: 12px;
          padding-bottom: 12px;
          transition: all 0.2s;
        }
        .btn-orange-submit:hover {
          background: #d97706 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
        }
        .social-btn-lux {
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #334155 !important;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .social-btn-lux:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>

      {/* TWO-COLUMN MATRIX ROW GRID */}
      <div className="row g-0 min-vh-100">

        {/* LEFT BRANDING PANE COLUMN */}
        <div className="col-12 col-xl-7 d-none d-xl-flex flex-column justify-content-between p-5 left-branding-pane">
          <div className="bg-mesh-overlay"></div>

          {/* Logo & Platform Tag */}
          <div className="d-flex align-items-center gap-3 z-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center text-white font-weight-bold" style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', fontSize: '1.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
              🖲️
            </div>
            <div>
              <h5 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.3px' }}>Smart Material Tracking &</h5>
              <p className="text-white-50 small mb-0">Business Management System</p>
            </div>
          </div>

          {/* Main Slogan Typography */}
          <div className="my-auto ps-4 z-3" style={{ maxWidth: '620px' }}>
            <span className="badge px-3 py-2 mb-3 rounded-pill text-white small" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              📍 Real-time Tracking Active
            </span>
            <h1 className="text-white fw-bold display-4 lh-1.1 mb-3" style={{ letterSpacing: '-1.5px' }}>
              Manage.<br />Track.<br />Optimize. <span style={{ color: '#38bdf8' }}>Grow.</span>
            </h1>
            <p className="text-muted fs-5 mb-0" style={{ lineHeight: '1.5', color: '#94a3b8 !important' }}>
              A smart platform to streamline your materials, operations, and business in one place.
            </p>
          </div>

          {/* Bottom Features Grid */}
          <div className="row g-4 z-3 border-top pt-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {[
              { icon: '📦', title: 'Material Tracking', desc: 'Real-time visibility' },
              { icon: '📊', title: 'Business Insights', desc: 'Data-driven decisions' },
              { icon: '⚙️', title: 'Operation Efficiency', desc: 'Automated workflows' },
              { icon: '🛡️', title: 'Secure & Reliable', desc: 'Enterprise security' }
            ].map((feat, idx) => (
              <div key={idx} className="col-6 col-sm-3">
                <div className="text-start">
                  <div className="fs-4 mb-1">{feat.icon}</div>
                  <h6 className="text-white fw-bold mb-0 small">{feat.title}</h6>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>{feat.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT INTERACTIVE LOGIN PANEL COLUMN */}
        <div className="col-12 col-xl-5 d-flex align-items-center justify-content-center p-3 p-sm-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>

          {/* FLOATING WHITE LUXURY SURFACE CARD */}
          <div className="login-card-surface p-4 p-sm-5">

            <div className="text-center mb-4">
              <h2 className="fw-black mb-1" style={{ color: '#ea580c', fontWeight: '900', fontSize: '2.1rem', letterSpacing: '-0.5px' }}>Welcome Back!</h2>
              <p className="text-muted small">Sign in with your role credentials</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 p-3 rounded-3 small fw-medium mb-3 d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ROLE SELECTION BAR PANEL */}
              <div className="mb-4">
                <label className="form-label text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>Select Your Role</label>
                <div className="d-flex justify-content-between gap-1">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className={`role-btn-lux d-flex flex-column align-items-center flex-grow-1 ${selectedRole === role.id ? 'active' : ''}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      {selectedRole === role.id && <div className="role-badge-check">✓</div>}
                      <span className="fs-5 mb-1">{role.icon}</span>
                      <span className="fw-semibold text-secondary" style={{ fontSize: '0.72rem' }}>{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EMAIL ELEMENT */}
              <div className="mb-3">
                <label className="form-label text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>Email Address</label>
                <div className="input-container-lux">
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted small">✉️</span>
                  <input
                    type="email"
                    className="form-control rounded-3 ps-5 small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@company.com"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD ELEMENT WITH TOGGLE EYE LOOK */}
              <div className="mb-3">
                <label className="form-label text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>Password</label>
                <div className="input-container-lux">
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted small">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control rounded-3 ps-5 pe-5 small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </div>
              </div>

              {/* REMEMBER & FORGOT LINK ROW */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="form-check d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    id="rememberCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#ea580c', cursor: 'pointer' }}
                  />
                  <label className="form-check-label small text-muted fw-medium" htmlFor="rememberCheck" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" style={{ color: '#ea580c', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* EXECUTE SUBMIT BUTTON */}
              <button type="submit" className="btn btn-orange-submit w-100 shadow-sm mb-4">
                Sign In →
              </button>
            </form>

            {/* SEPARATOR ASSET LINE */}
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1 text-muted opacity-25 m-0" />
              <span className="px-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>or continue with</span>
              <hr className="flex-grow-1 text-muted opacity-25 m-0" />
            </div>

            {/* SOCIAL OAUTH AUTHENTICATION BUTTON GRID */}
            <div className="row g-2">
              <div className="col-4">
                <button type="button" onClick={() => handleGoogleLoginSuccess()} className="btn social-btn-lux w-100 py-2 d-flex align-items-center justify-content-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.2c-2.073-1.933-4.957-3.13-8.274-3.13C5.355 0 0 5.367 0 12s5.355 12 12.24 12c7.19 0 11.97-5.025 11.97-12.18 0-.825-.09-1.455-.2-1.815H12.24z" />
                  </svg>
                  Google
                </button>
              </div>
              <div className="col-4">
                <button type="button" onClick={() => alert('Microsoft integration placeholder active')} className="btn social-btn-lux w-100 py-2 d-flex align-items-center justify-content-center gap-1">
                  <span style={{ fontSize: '0.75rem' }}>🟦</span> Microsoft
                </button>
              </div>
              <div className="col-4">
                <button type="button" onClick={() => alert('Apple integration placeholder active')} className="btn social-btn-lux w-100 py-2 d-flex align-items-center justify-content-center gap-1">
                  <span style={{ fontSize: '0.75rem' }}>🍏</span> Apple
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-muted small mb-0 fw-medium">
              Don&apos;t have an account? <Link to="/register" className="ms-1 fw-bold" style={{ color: '#ea580c', textDecoration: 'none' }}>Register Workspace</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;