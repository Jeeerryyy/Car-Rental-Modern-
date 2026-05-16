import api from './axiosInstance';

export const getStaff = () => api.get('/owner/staff');
export const createStaff = (data) => api.post('/owner/staff', data);
export const toggleStaffStatus = (id) => api.patch(`/owner/staff/${id}/toggle`);
export const deleteStaff = (id) => api.delete(`/owner/staff/${id}`);
