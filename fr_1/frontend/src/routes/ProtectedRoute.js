import { Navigate } from 'react-router-dom';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1] || ''));
    return !!payload?.id;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('smtbms_token');
  if (!isTokenValid(token)) {
    localStorage.removeItem('smtbms_token');
    localStorage.removeItem('smtbms_user');
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
