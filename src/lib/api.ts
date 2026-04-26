import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const getApiBaseUrl = () => {
  // In development, use relative /api (proxied to localhost:3001 via vite.config.ts)
  // In production, use the full API_URL from env
  if (import.meta.env.PROD) {
    const API_URL = "https://trunorth-super-app.onrender.com";
    const apiUrl = import.meta.env.VITE_API_URL || API_URL;
    try {
      const url = new URL(apiUrl);
      url.pathname = '/api';
      return url.toString().replace(/\/$/, '');
    } catch (error) {
      console.error('Invalid VITE_API_URL:', apiUrl, error);
      return '/api';
    }
  }
  // Development: use relative path which Vite proxies to localhost:3001
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth state if we get a 401
      useAuth.getState().logout();
      
      // Optionally redirect to login, but we use hash router so this is a basic approach
      if (window.location.hash !== '#/login' && window.location.hash !== '#/register') {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;