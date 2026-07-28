export const getCurrentUser = () => {
  const raw = localStorage.getItem('smtbms_user');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id,
        role: (parsed.role || '').toUpperCase(),
        email: parsed.email,
        name: parsed.name,
        department: parsed.department || 'General',
      };
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
      role: (payload.role || '').toUpperCase(),
      email: payload.email,
      name: payload.name,
      department: payload.department || 'General',
    };
  } catch {
    return null;
  }
};

export const hasRole = (allowedRoles) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  return allowedRoles.map(r => r.toUpperCase()).includes(user.role);
};