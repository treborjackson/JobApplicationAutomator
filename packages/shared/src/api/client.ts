import axios from 'axios';

const BASE_URL =
  typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE_URL
    ? process.env.EXPO_PUBLIC_API_BASE_URL
    : typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000'
    : 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
