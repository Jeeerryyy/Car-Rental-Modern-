import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

const ownerRoutes = [
  '/dashboard', '/fleet', '/bookings', '/clients', '/settings',
  '/support', '/promos', '/reviews', '/reports', '/calendar',
  '/notifications', '/profile', '/signin', '/staff'
];

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('owner');
      const isOwnerRoute = ownerRoutes.some(route =>
        window.location.pathname === route ||
        window.location.pathname.startsWith(route + '/')
      );
      if (isOwnerRoute || window.location.pathname === '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;