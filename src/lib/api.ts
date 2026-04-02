import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const api = axios.create({
  baseURL: '/api',
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

export default api;
