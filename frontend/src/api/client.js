import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { Accept: 'application/json' },
});

export const AUTH_SESSION_EXPIRED_EVENT = 'subtracker:auth-session-expired';

const isAuthRoute = (url = '') => /\/auth\/(login|register)$/.test(url);

api.interceptors.request.use(config => {
  if (!isAuthRoute(config.url)) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => {
    if (
      res.config?.responseType !== 'blob' &&
      typeof res.data === 'string' &&
      /<html|<!doctype html/i.test(res.data)
    ) {
      return Promise.reject(new Error(
        'The API request returned the hosted React app instead of JSON. Set VITE_API_BASE_URL to your deployed backend /api URL before building for Firebase.'
      ));
    }
    return res;
  },
  err => {
    if (err.response?.status === 401 && !isAuthRoute(err.config?.url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const subscriptionApi = {
  getAll: (currency) => api.get('/subscriptions', { params: currency ? { currency } : {} }),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  remove: (id) => api.delete(`/subscriptions/${id}`),
};

export const reportApi = {
  csv: (currency) => api.get('/reports/subscriptions.csv', {
    params: { currency },
    responseType: 'blob',
  }),
  pdf: (currency) => api.get('/reports/subscriptions.pdf', {
    params: { currency },
    responseType: 'blob',
  }),
};
