import api from './axiosInstance';

export const ownerLogin = (data) => api.post('/owner/auth/login', data);
export const ownerRegister = (data) => api.post('/owner/auth/register', data);
export const ownerLogout = () => api.post('/owner/auth/logout');
export const getOwnerMe = () => api.get('/owner/auth/profile');
export const updateOwnerProfile = (data) => api.put('/owner/auth/profile', data);
export const changeOwnerPassword = (data) => api.post('/owner/auth/change-password', data);
