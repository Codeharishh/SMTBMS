// LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; // 🟢 Added Google Hook
import { login, googleLogin } from '../services/authService'; // 🟢 Added googleLogin Service Hook

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      localStorage.setItem('smtbms_token', data.token);
      localStorage.setItem('smtbms_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  // 🟢 GOOGLE AUTHENTICATION CLIENT INTERCEPTOR
  const handleGoogleLoginSuccess = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      try {
        // Sends access_token to backend route for confirmation/registration
        const data = await googleLogin({ token: tokenResponse.access_token });
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
    <div className="d-flex align-items-center justify-content-center vh-100 position-relative overflow-hidden" style={{
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 90.2%)',
      backgroundColor: 'var(--bg)',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Floating decorative gradient bubble accents */}
      <div className="position-absolute rounded-circle opacity-20" style={{ top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
      <div className="position-absolute rounded-circle opacity-20" style={{ bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

      <div className="card p-5 border-0 shadow-lg position-relative lux-auth-card" style={{
        width: '450px',
        backgroundColor: 'var(--surface)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--card-border) !important',
      }}>
        {/* Top colored accent indicator bar */}
        <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}></div>

        <div className="text-center mb-4 mt-2">
          <span className="fs-1 d-block mb-2">⚡</span>
          <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>SMTBMS Sign In</h3>
          <p className="text-muted small mb-0">Enter your credentials to access the enterprise workstation.</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 p-3 rounded-3 small fw-medium mb-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary mb-1">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">✉️</span>
              <input
                type="email"
                className="form-control rounded-3 ps-5 py-2.5 hover-input-lux text-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary mb-1">Password</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">🔑</span>
              <input
                type="password"
                className="form-control rounded-3 ps-5 py-2.5 hover-input-lux text-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ fontSize: '0.9rem', letterSpacing: '1.5px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn w-100 py-2.5 shadow-sm text-white hover-btn-lux fw-bold" style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '12px'
          }}>
            Log In System
          </button>
        </form>

        {/* 🟢 STEP 4: OR SEPARATOR DECORATION BAR */}
        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1 text-muted opacity-25 m-0" />
          <span className="px-3 text-uppercase text-muted fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '1px' }}>or securely via</span>
          <hr className="flex-grow-1 text-muted opacity-25 m-0" />
        </div>

        {/* 🟢 STEP 5: UX LUXURY DESIGNED GOOGLE SINGLE-SIGN-ON ASSET BUTTON */}
        <button
          type="button"
          onClick={() => handleGoogleLoginSuccess()}
          className="btn w-100 py-2.5 bg-white border d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 hover-btn-lux"
          style={{ borderColor: '#e2e8f0', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.2c-2.073-1.933-4.957-3.13-8.274-3.13C5.355 0 0 5.367 0 12s5.355 12 12.24 12c7.19 0 11.97-5.025 11.97-12.18 0-.825-.09-1.455-.2-1.815H12.24z" />
          </svg>
          Continue with Google Workspace
        </button>

        <p className="mt-4 text-center text-muted small mb-0 fw-medium">
          Don&apos;t have an account? <Link to="/register" className="ms-1 fw-bold" style={{ color: '#6366f1', textDecoration: 'none' }}>Register Workspace</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;