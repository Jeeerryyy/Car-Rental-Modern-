import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('customerToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer');
      localStorage.removeItem('customerToken');
      
      // Do not redirect if the request was checking the auth status
      if (error.config && error.config.url && error.config.url.endsWith('/auth/profile')) {
        return Promise.reject(error);
      }

      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleAuth: (credential: string) => api.post('/auth/google', { credential }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

export const carAPI = {
  getAll: (params?: Record<string, any>) => api.get('/cars', { params }),
  getById: (id: string) => api.get(`/cars/${id}`),
  search: (params?: Record<string, any>) => api.get('/search', { params }),
  getCategories: () => api.get('/cars/categories'),
  getLocations: () => api.get('/cars/locations'),
  getFeatured: () => api.get('/cars/featured'),
};

export const bookingAPI = {
  create: (data: any) => api.post('/bookings', data),
  createCashBooking: (data: any) => api.post('/bookings/cash-booking', data),
  verifyPayment: (params: Record<string, any>) => api.get('/bookings/verify-payment', { params }),
  getMyBookings: (params?: Record<string, any>) => api.get('/bookings/my-bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
  getInvoiceHTML: (id: string) => api.get(`/bookings/${id}/invoice`),
};

export const reviewAPI = {
  create: (data: any) => api.post('/reviews', data),
  getByCar: (carId: string, params?: Record<string, any>) => api.get(`/cars/${carId}/reviews`, { params }),
};

export const promoAPI = {
  validate: (data: any) => api.post('/promo/validate', data),
  getFeatured: () => api.get('/promo/featured'),
};

export const contactAPI = {
  submit: (data: any) => api.post('/contact', data),
};

export const uploadAPI = {
  documents: (formData: FormData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
