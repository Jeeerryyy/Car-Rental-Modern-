import api from './axiosInstance';

export const getSettings = () => api.get('/owner/settings');
export const updateSettings = (data) => api.put('/owner/settings', data);
