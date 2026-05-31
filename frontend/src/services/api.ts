import axios from 'axios';
import type { User, LoginRequest, RegisterRequest, TextToImageRequest, ImageResponse, CreditTransaction, Subscription } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// 认证相关
export const authAPI = {
  register: (data: RegisterRequest) => api.post<User>('/auth/register', data),
  login: (data: LoginRequest) => api.post<{ access_token: string; token_type: string }>('/auth/login', new URLSearchParams(data)),
  getCurrentUser: () => api.get<User>('/auth/me'),
};

// 积分相关
export const creditsAPI = {
  getBalance: () => api.get<{ credits: number }>('/credits/balance'),
  recharge: (amount: number, payment_method: string) => api.post('/credits/recharge', { amount, payment_method }),
  getHistory: (limit = 50) => api.get<CreditTransaction[]>('/credits/history', { params: { limit } }),
  getCosts: () => api.get('/credits/costs'),
};

// 会员相关
export const membershipAPI = {
  subscribe: (subscription_type: string, membership_level: string, payment_method: string) =>
    api.post<Subscription>('/membership/subscribe', { subscription_type, membership_level, payment_method }),
  getStatus: () => api.get('/membership/status'),
  getSubscriptions: () => api.get<Subscription[]>('/membership/subscriptions'),
  getBenefits: () => api.get('/membership/benefits'),
};

// 图片处理相关
export const imageAPI = {
  textToImage: (data: TextToImageRequest) => api.post<ImageResponse>('/text-to-image/generate', data),
  imageToImage: (file: File, prompt: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    return api.post<ImageResponse>('/image-to-image/generate', formData);
  },
  removeBackground: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImageResponse>('/remove-bg/process', formData);
  },
  resize: (file: File, width: number, height: number, maintain_aspect_ratio = true) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImageResponse>('/image-utils/resize', formData, {
      params: { width, height, maintain_aspect_ratio }
    });
  },
  getInfo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/image-utils/info', formData);
  },
};

export default api;
