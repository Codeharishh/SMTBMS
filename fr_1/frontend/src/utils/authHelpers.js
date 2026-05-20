export const getCurrentUser = () => {
  const raw = localStorage.getItem('smtbms_user');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem('smtbms_user');
    }
  }

  const token = localStorage.getItem('smtbms_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(window.atob(token.split('.')[1] || ''));
    return {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
};

export const hasRole = (allowedRoles) => {
  const user = getCurrentUser();
  return user && allowedRoles.includes(user.role);
};
