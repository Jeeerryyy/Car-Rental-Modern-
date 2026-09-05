import api from './axiosInstance';

export const getBookings = (params) => api.get('/owner/bookings', { params });
export const getBookingById = (id) => api.get(`/owner/bookings/${id}`);
export const updateBookingStatus = (id, data) => api.put(`/owner/bookings/${id}/status`, data);
export const createManualBooking = (data) => api.post('/owner/bookings/manual', data);
export const uploadOwnerDocuments = (id, data) => api.post(`/owner/bookings/${id}/documents`, data);
export const deleteBooking = (id) => api.delete(`/owner/bookings/${id}`);

/**
 * Get the invoice HTML content for a booking
 */
export const getInvoiceHTML = (id) => api.get(`/owner/bookings/${id}/invoice`);
export const searchCustomers = (query) => api.get('/owner/bookings/search-customer', { params: { q: query } });
export const lookupCustomerByPhone = (phone) => api.get('/owner/bookings/customer-by-phone', { params: { phone } });
