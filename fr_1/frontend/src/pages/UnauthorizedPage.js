import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-5 shadow" style={{ width: '420px' }}>
        <h3 className="mb-4">Access Denied</h3>
        <p className="text-muted">You do not have permission to access this page.</p>
        <Link to="/" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
