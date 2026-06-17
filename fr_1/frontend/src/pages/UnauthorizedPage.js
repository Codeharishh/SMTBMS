import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="container-fluid px-4 py-4 d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="card border-0 premium-card-lux p-5 text-center shadow-sm" style={{ maxWidth: '440px', backgroundColor: 'var(--surface)' }}>
        <div className="fs-1 mb-3">🚫</div>
        <h3 className="fw-bold mb-2 text-dark">Access Restricted</h3>
        <p className="text-muted small mb-4">You do not have the required authorization credentials to view this workspace directory.</p>
        <Link to="/" className="btn btn-primary rounded-3 w-100 py-2.5 fw-semibold shadow-sm">
          Return to Workstation
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
