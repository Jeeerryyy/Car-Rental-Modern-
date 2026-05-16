import api from './axiosInstance';

export const getCars = (params) => api.get('/owner/cars/my-cars', { params });
export const getCarById = (id) => api.get(`/owner/cars/${id}`);
export const createCar = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      value.forEach(file => formData.append('images', file));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.post('/owner/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateCar = (id, data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      value.forEach(file => formData.append('images', file));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.put(`/owner/cars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteCar = (id) => api.delete(`/owner/cars/${id}`);
export const toggleCarAvailability = (id) => api.patch(`/owner/cars/${id}/toggle`);
export const addBlockedDates = (id, data) => api.post(`/owner/cars/${id}/blocked-dates`, data);
export const removeBlockedDates = (id, blockId) => api.delete(`/owner/cars/${id}/blocked-dates/${blockId}`);
