import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
export const vendorSignup = (data: any) => api.post('/auth/vendor/signup', data);
export const vendorLogin = (data: any) => api.post('/auth/vendor/login', data);
export const deliveryPartnerSignup = (data: any) => api.post('/auth/delivery/signup', data);
export const deliveryPartnerLogin = (data: any) => api.post('/auth/delivery/login', data);
export const getMe = () => api.get('/auth/me');

// Orders
export const createOrderApi = (data: any) => api.post('/orders', data);
export const getVendorOrdersApi = () => api.get<import('../types').Order[]>('/orders/vendor');
export const getDeliveryPartnerOrderApi = () => api.get<import('../types').Order>('/orders/delivery');
export const assignDeliveryPartnerApi = (orderId: string, deliveryPartnerId: string) => 
  api.put(`/orders/${orderId}/assign`, { deliveryPartnerId });
export const startDeliveryApi = (orderId: string) => api.put(`/orders/${orderId}/start`);
export const trackOrderApi = (orderId: string) => api.get<import('../types').Order>(`/orders/${orderId}/track`);
export const getAvailableDeliveryPartnersApi = () => api.get<import('../types').User[]>('/orders/delivery-partners/available');