import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../services/authService';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import ChatWidget from '../components/ChatWidget';

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
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

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setHasUnreadChat(false);
  };

  return (
    <div className="app-shell">
      {/* Sidebar is position:fixed so we push content right by its exact width */}
      <Sidebar darkMode={darkMode} />

      {/* This div takes up all remaining space to the right of the sidebar */}
      <div style={{ marginLeft: '260px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopNavbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          isChatOpen={isChatOpen}
          setIsChatOpen={(val) => {
            setIsChatOpen(val);
            if (val) setHasUnreadChat(false);
          }}
          hasUnreadChat={hasUnreadChat}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Slide-in AI Assistant Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        onNewMessage={() => {
          if (!isChatOpen) setHasUnreadChat(true);
        }}
      />
    </div>
  );
};

export default MainLayout;