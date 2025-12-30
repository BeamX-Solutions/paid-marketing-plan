import axios from 'axios';
import { AuthResponse, ApiResponse, MarketingPlan, PlanFormData, DashboardData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const plansAPI = {
  create: async (planData: PlanFormData): Promise<ApiResponse<MarketingPlan>> => {
    const response = await api.post('/plans/create', planData);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<MarketingPlan[]>> => {
    const response = await api.get('/plans');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<MarketingPlan>> => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  generate: async (id: string): Promise<ApiResponse<MarketingPlan>> => {
    const response = await api.post(`/plans/${id}/generate`);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  },
};

export const analyticsAPI = {
  track: async (event: string, properties?: Record<string, unknown>): Promise<ApiResponse> => {
    const response = await api.post('/analytics/track', { event, properties });
    return response.data;
  },

  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};

export const emailAPI = {
  sendPlan: async (planId: string, recipientEmail: string, message?: string): Promise<ApiResponse> => {
    const response = await api.post(`/email/send-plan/${planId}`, { recipientEmail, message });
    return response.data;
  },

  sendWelcome: async (): Promise<ApiResponse> => {
    const response = await api.post('/email/welcome');
    return response.data;
  },
};