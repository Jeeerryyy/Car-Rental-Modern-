import api from './axiosInstance';

export const getPromos = (params) => api.get('/owner/promos', { params });
export const createPromo = (data) => api.post('/owner/promos', data);
export const updatePromo = (id, data) => api.put(`/owner/promos/${id}`, data);
export const togglePromo = (id) => api.patch(`/owner/promos/${id}/toggle`);
export const toggleFeatured = (id) => api.patch(`/owner/promos/${id}/featured`);
export const deletePromo = (id) => api.delete(`/owner/promos/${id}`);
