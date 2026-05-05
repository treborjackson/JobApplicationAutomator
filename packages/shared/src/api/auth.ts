import { apiClient } from './client';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; full_name: string; }
export interface AuthTokens { access_token: string; refresh_token: string; token_type: string; }
export interface User { id: string; email: string; full_name: string; created_at: string; }

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<AuthTokens>('/auth/register', data),
  login: (data: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get<User>('/auth/me'),
  refresh: (refresh_token: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refresh_token }),
  registerPushToken: (expo_push_token: string) =>
    apiClient.post('/auth/push-token', { expo_push_token }),
};
