import api from './axiosInstance';

export const getBookings = (params) => api.get('/owner/bookings', { params });
export const getBookingById = (id) => api.get(`/owner/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.put(`/owner/bookings/${id}/status`, data);
export const createManualBooking = (data) => api.post('/owner/bookings/manual', data);
