import { API_BASE_URL } from '../config/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path, params) {
  const query = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

async function request(path, { method = 'GET', token, body, params } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const looksLikeHtml = /<html|<!doctype html/i.test(text);
  let data = null;

  if (text && contentType.includes('application/json')) {
    data = JSON.parse(text);
  } else if (text && !looksLikeHtml) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.error || data?.message || 'Request failed', response.status, data);
  }

  if (looksLikeHtml) {
    throw new ApiError('The API returned HTML instead of JSON. Check the mobile API base URL.', response.status, null);
  }

  return data;
}

export const authApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
};

export const subscriptionApi = {
  getAll: (token, currency) => request('/subscriptions', { token, params: { currency } }),
  create: (token, payload) => request('/subscriptions', { method: 'POST', token, body: payload }),
  update: (token, id, payload) => request(`/subscriptions/${id}`, { method: 'PUT', token, body: payload }),
  remove: (token, id) => request(`/subscriptions/${id}`, { method: 'DELETE', token }),
};

export { ApiError };
