import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ANALYST_KEY = import.meta.env.VITE_ANALYST_KEY || 'fraudradar-analyst-secret-key-2026';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-analyst-key': ANALYST_KEY,
  },
});

export const api = {
  // Health & connection check
  async checkHealth() {
    const response = await client.get('/health');
    return response.data;
  },

  // Fetch metrics for analytics summary
  async getMetrics() {
    const response = await client.get('/metrics');
    return response.data;
  },

  // Fetch transactions with query filters
  async getTransactions(params = {}) {
    const response = await client.get('/transactions', { params });
    return response.data;
  },

  // Fetch single transaction details
  async getTransactionById(id) {
    const response = await client.get(`/transactions/${id}`);
    return response.data;
  },

  // Create a new transaction (runs backend risk engine)
  async createTransaction(transactionData) {
    const response = await client.post('/transactions', transactionData);
    return response.data;
  },

  // Update review status (CONFIRMED_FRAUD, DISMISSED, PENDING) - requires analyst auth
  async updateTransactionStatus(id, updateData) {
    const response = await client.patch(`/transactions/${id}/status`, updateData);
    return response.data;
  },

  // Seed 15-20 demo transactions - requires analyst auth
  async seedDemoData() {
    const response = await client.post('/seed');
    return response.data;
  },
};

export default api;
