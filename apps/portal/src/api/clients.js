import api from './axiosInstance';

export const getClients = (params) => api.get('/owner/clients', { params });
export const getClientById = (id) => api.get(`/owner/clients/${id}`);
export const updateContactStatus = (id, data) => api.put(`/owner/clients/${id}/status`, data);
