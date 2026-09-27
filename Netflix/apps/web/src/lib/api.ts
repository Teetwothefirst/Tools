import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    let message = error.response?.data?.error?.details || error.message;
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      message = 'Could not connect to the server. Please check your internet connection.';
    }
    return Promise.reject(new Error(message || 'API request failed'));
  }
);
