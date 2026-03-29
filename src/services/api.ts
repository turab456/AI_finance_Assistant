import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';
import storage from './storage';

const API_BASE_URL = API_URL;

console.log('API BASE URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ✅ REQUEST INTERCEPTOR (FIXED + SAFE)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getToken();

      console.log('INTERCEPTOR HIT');
      console.log('TOKEN:', token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('⚠️ NO TOKEN FOUND');
      }

      return config;
    } catch (err) {
      console.log('INTERCEPTOR ERROR:', err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);


// ✅ RESPONSE INTERCEPTOR (VERY IMPORTANT FOR DEBUGGING)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('❌ API ERROR STATUS:', error?.response?.status);
    console.log('❌ API ERROR DATA:', error?.response?.data);
    console.log('❌ FULL ERROR:', error);

    return Promise.reject(error);
  }
);


// ================= AUTH =================
export const authApi = {
  async createUser(phone: string, monthlyIncome: number) {
    try {
      console.log('SENDING DATA:', {
        phone,
        monthly_income: monthlyIncome,
        type: typeof monthlyIncome
      });

      const response = await axios.post(`${API_BASE_URL}/users`, {
        phone: String(phone),
        monthly_income: Number(monthlyIncome)
      });

      console.log('FULL RESPONSE:', JSON.stringify(response.data, null, 2));
      console.log('TOKEN >>>', response.data?.token);

      if (response.data?.token) {
        await storage.setToken(response.data.token);

        // verify save
        const savedToken = await storage.getToken();
        console.log('SAVED TOKEN:', savedToken);
      } else {
        console.log('⚠️ TOKEN NOT FOUND IN RESPONSE');
      }

      return response.data;
    } catch (error) {
      console.log('CREATE USER ERROR:', error);
      throw error;
    }
  },

  async getMe() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.log('GET ME ERROR:', error);
      throw error;
    }
  },

  async updateUserPhone(userId: number, phone: string) {
    try {
      const response = await api.put(`/users/${userId}`, { phone });
      return response.data;
    } catch (error) {
      console.log('UPDATE PHONE ERROR:', error);
      throw error;
    }
  },

  async updateUserSalary(userId: number, monthly_income: number) {
    try {
      const response = await api.put(`/users/${userId}`, {
        monthly_income: Number(monthly_income)
      });
      return response.data;
    } catch (error) {
      console.log('UPDATE SALARY ERROR:', error);
      throw error;
    }
  }
};


// ================= TRANSACTIONS =================
let insightsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 30000;

export const transactionsApi = {
  async getInsights(forceRefresh = false) {
    const now = Date.now();

    if (forceRefresh) {
      insightsCache = null;
    }

    if (insightsCache && (now - insightsCache.timestamp < CACHE_DURATION)) {
      console.log('Returning cached insights');
      return insightsCache.data;
    }

    try {
      // check token before request
      const token = await storage.getToken();
      console.log('TOKEN BEFORE INSIGHTS:', token);

      const response = await api.get('/insights');

      insightsCache = {
        data: response.data,
        timestamp: now
      };

      return response.data;
    } catch (error) {
      console.log('GET INSIGHTS ERROR:', error);

      if (insightsCache) return insightsCache.data;

      throw error;
    }
  },

  clearCache() {
    insightsCache = null;
  }
};

export default api;