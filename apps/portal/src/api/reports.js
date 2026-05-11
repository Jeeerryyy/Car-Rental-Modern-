import api from './axiosInstance';

export const getRevenueReport = (params) => api.get('/owner/reports/revenue', { params });
export const getFleetReport = () => api.get('/owner/reports/fleet');
export const getBookingsReport = (params) => api.get('/owner/reports/bookings', { params });
export const exportBookingsCSV = (params) => api.get('/owner/reports/export', { params, responseType: 'blob' });
