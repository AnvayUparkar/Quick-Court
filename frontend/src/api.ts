// Facility Rating API call
export const rateFacility = (facilityId: string, rating: number, comment: string) =>
  api.post(`/api/facilities/${facilityId}/rate`, { rating, comment });
// api.js or api.ts - Create this file if it doesn't exist
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://quick-court-wrx0.onrender.com", // your backend URL',
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor: Request to:', config.url);
    console.log('API Interceptor: Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor: Authorization header set');
    } else {
      console.log('API Interceptor: No token found, request will be sent without authorization');
    }
    return config;
  },
  (error) => {
    console.error('API Interceptor: Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Interceptor: Response received from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Interceptor: Response error from:', error.config?.url, 'Status:', error.response?.status);

    const originalRequest = error.config;

    // If no response or not 401, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Refresh token flow
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token available, clear storage and reject
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject(error);
    }

    // Use a single refresh request for concurrent 401s
    if ((api as any)._isRefreshing) {
      return new Promise((resolve, reject) => {
        (api as any)._refreshSubscribers.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    (api as any)._isRefreshing = true;
    (api as any)._refreshSubscribers = [];

    return new Promise((resolve, reject) => {
      api.post('/api/auth/refresh-token', { refreshToken })
        .then((res) => {
          const { token: newToken, refreshToken: newRefreshToken } = res.data;
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          (api as any)._isRefreshing = false;
          (api as any)._refreshSubscribers.forEach((cb: any) => cb(newToken));
          (api as any)._refreshSubscribers = [];

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        })
        .catch((err) => {
          (api as any)._isRefreshing = false;
          (api as any)._refreshSubscribers = [];
          // Clear auth state on failure
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          reject(err);
        });
    });
    
  }
);

export default api;

export const deleteBooking = (bookingId: string) => api.delete(`/api/bookings/${bookingId}`);

export const getAllFacilities = () => api.get(`/api/facilities`);

// Facility Management API calls
export const getOwnerFacilities = (ownerId: string) => api.get(`/api/facilities/owner/${ownerId}`);
export const createFacility = (facilityData: FormData) => api.post('/api/facilities', facilityData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const updateFacility = (id: string, facilityData: FormData) => api.put(`/api/facilities/${id}`, facilityData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteFacility = (id: string) => api.delete(`/api/facilities/${id}`);

// Court Management API calls
export const getFacilityCourts = (facilityId: string) => api.get(`/api/facilities/${facilityId}/courts`);
export const getCourtDetails = (facilityId: string, courtId: string) => api.get(`/api/facilities/${facilityId}/courts/${courtId}`);
export const addCourt = (facilityId: string, courtData: any) => api.post(`/api/facilities/${facilityId}/courts`, courtData);
export const updateCourt = (facilityId: string, courtId: string, courtData: any) => api.put(`/api/facilities/${facilityId}/courts/${courtId}`, courtData);
export const deleteCourt = (facilityId: string, courtId: string) => api.delete(`/api/facilities/${facilityId}/courts/${courtId}`);
export const addTimeSlot = (facilityId: string, courtId: string, slotData: any) => api.post(`/api/facilities/${facilityId}/courts/${courtId}/slots`, slotData);
export const removeTimeSlot = (facilityId: string, courtId: string, slotId: string) => api.delete(`/api/facilities/${facilityId}/courts/${courtId}/slots/${slotId}`);
export const requestOTP = (email: string) => api.post('/api/auth/resend-otp', { email });