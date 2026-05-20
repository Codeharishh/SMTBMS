import { useMemo } from 'react';

const TopNavbar = ({ darkMode, setDarkMode, onLogout }) => {
  const buttonVariant = darkMode ? 'btn-light' : 'btn-outline-dark';

  const userData = useMemo(() => {
    const raw = localStorage.getItem('smtbms_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || 'Admin',
          role: parsed.role || 'User',
          department: parsed.department || 'General',
        };
      } catch {
        return { name: 'Admin', role: 'User', department: 'General' };
      }
    }

    return { name: 'Admin', role: 'User', department: 'General' };
  }, []);

  return (
    <header className="topbar px-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <h5 className="mb-0">Welcome back, {userData.name || 'Leader'}</h5>
        <small className="text-muted d-block">
          Role: {userData.role || 'User'} | Department: {userData.department || 'General'}
        </small>
      </div>
      <div className="d-flex align-items-center gap-2">
        <button type="button" className={`btn btn-sm ${buttonVariant}`} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
