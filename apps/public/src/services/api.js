import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer');
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

export const carAPI = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  search: (params) => api.get('/search', { params }),
  getCategories: () => api.get('/cars/categories'),
  getLocations: () => api.get('/cars/locations'),
  getFeatured: () => api.get('/cars/featured'),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  verifyPayment: (params) => api.get('/bookings/verify-payment', { params }),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByCar: (carId, params) => api.get(`/cars/${carId}/reviews`, { params }),
};

export const promoAPI = {
  validate: (data) => api.post('/promo/validate', data),
  getFeatured: () => api.get('/promo/featured'),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export const uploadAPI = {
  documents: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
