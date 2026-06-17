// src/components/TopNavbar.js
import React, { useMemo, useEffect } from 'react';

const TopNavbar = ({ darkMode, setDarkMode, onLogout }) => {
  const buttonVariant = darkMode ? 'btn-light' : 'btn-outline-dark';

  // 🟢 DIRECT SYNC LAYER: Explicitly coordinates the body node's document classes on mount/toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const userData = useMemo(() => {
    const raw = localStorage.getItem('smtbms_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          name: parsed.name || 'Admin',
          role: parsed.role || 'User',
        };
      } catch {
        return { name: 'Admin', role: 'User' };
      }
    }
    return { name: 'Admin', role: 'User' };
  }, []);

  return (
    <header className="topbar px-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <h5 className="mb-0 fw-bold">Welcome back, {userData.name}</h5>
        <small className="text-muted d-block">
          Role: {userData.role}
        </small>
      </div>
      <div className="d-flex align-items-center gap-2">

        <button type="button" className="btn btn-primary btn-sm fw-semibold shadow-sm px-3" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;