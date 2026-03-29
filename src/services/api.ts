import axios from 'axios';

// Replace with your actual backend URL
const API_BASE_URL = 'http://100.54.5.93'; // Standard Android emulator localhost

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionsApi = {
  async getInsights(userId = 1) {
    try {
      const response = await api.get(`/insights`, { params: { user_id: userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching insights', error);
      throw error;
    }
  },
};

export default api;
