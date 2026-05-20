import { Navigate } from 'react-router-dom';
import { hasRole, getCurrentUser } from '../utils/authHelpers';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default RoleBasedRoute;
