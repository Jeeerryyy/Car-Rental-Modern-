import api from './axiosInstance';

export const getReviews = (params) => api.get('/owner/reviews', { params });
export const updateReviewStatus = (id, data) => api.put(`/owner/reviews/${id}/status`, data);
