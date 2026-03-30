import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';
import storage from './storage';

const API_BASE_URL = API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (err) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);


// ================= AUTH =================
export const authApi = {
  async createUser(phone: string, monthlyIncome: number) {
    const response = await axios.post(`${API_BASE_URL}/users`, {
      phone: String(phone),
      monthly_income: Number(monthlyIncome)
    });

    if (response.data?.token) {
      await storage.setToken(response.data.token);
    }

    return response.data;
  },

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateUserPhone(userId: number, phone: string) {
    const response = await api.put(`/users/${userId}`, { phone });
    return response.data;
  },

  async updateUserSalary(userId: number, monthly_income: number) {
    const response = await api.put(`/users/${userId}`, {
      monthly_income: Number(monthly_income)
    });
    return response.data;
  },
  updateUserBalance: async (userId: number, balance: number) => {
    const response = await api.put(`/users/${userId}`, {
      current_balance: balance,
    });
    return response.data;
  },
};


// ================= TRANSACTIONS =================
let insightsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 30000;

export const transactionsApi = {
  async getInsights(forceRefresh = false) {
    if (forceRefresh) {
      insightsCache = null;
    }

    if (insightsCache && (Date.now() - insightsCache.timestamp < CACHE_DURATION)) {
      return insightsCache.data;
    }

    try {
      const response = await api.get('/insights');

      insightsCache = {
        data: response.data,
        timestamp: Date.now()
      };

      return response.data;
    } catch (error) {
      if (insightsCache) return insightsCache.data;

      throw error;
    }
  },

  clearCache() {
    insightsCache = null;
  }
};

export default api;