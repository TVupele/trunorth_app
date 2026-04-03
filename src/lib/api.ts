import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      // Use the URL constructor for a robust way to combine base URL and path
      const url = new URL(apiUrl);
      url.pathname = '/api';
      // Return the URL as a string, removing any trailing slash for consistency
      return url.toString().replace(/\/$/, '');
    } catch (error) {
      console.error('Invalid VITE_API_URL:', apiUrl, error);
      // Fallback to relative path on error
      return '/api';
    }
  }
  // For local development or when VITE_API_URL is not set, use a relative path
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

export default api;