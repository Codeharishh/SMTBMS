import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outbound Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smtbms_token');
    if (token) {
      // Use standard object bracket notation to ensure safe structural mapping
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Inbound Response Interceptor (Graceful Error Catcher)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ONLY wipe token and redirect if the authentication token is dead/invalid (401)
    if (error.response && error.response.status === 401) {

      // 1. Wipe local identity states cleanly
      localStorage.removeItem('smtbms_token');
      localStorage.removeItem('smtbms_user');

      // 2. FORCE REDIRECT to stop background cascade requests from firing
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Return standardized payload rejecting forward promises safely
    return Promise.reject(error);
  }
);

export default api;