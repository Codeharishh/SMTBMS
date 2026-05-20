import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../services/authService';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('smtbms_theme');
    setDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('smtbms_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar darkMode={darkMode} />
      <div className="flex-fill">
        <TopNavbar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
