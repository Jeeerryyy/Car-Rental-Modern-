import api from '../axiosInstance.js';

export const getAllCars = (params) => api.get('/cars', { params });
export const getCarById = (id) => api.get(`/cars/${id}`);
export const getFeaturedCars = () => api.get('/cars/featured');

export const createOrder = (body) => api.post('/bookings/create-order', body);
export const verifyPayment = (body) => api.post('/bookings/verify-payment', body);
export const getMyBookings = (params) => api.get('/bookings/my-bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

export const uploadDocuments = (body) => api.post('/upload/document', body);
export const uploadSignature = (body) => api.post('/upload/signature', body);

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const me = () => api.get('/auth/me');
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);

export const validatePromo = (code, orderValue) => api.post('/promo/validate', { code, orderValue });

export const createCashBooking = (body) => api.post('/bookings/cash-booking', body);