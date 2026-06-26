import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uzamali_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('uzamali_token');
      localStorage.removeItem('uzamali_user');
      localStorage.removeItem('uzamali_points');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
