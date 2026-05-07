import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '@/lib/api';

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  hydrated: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      setAuthToken(token);
      try {
        const { data } = await api.get('/auth/me');
        set({ user: data, accessToken: token, hydrated: true });
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        set({ hydrated: true });
      }
    } else {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.access_token);
    await SecureStore.setItemAsync('accessToken', data.access_token);
    set({ user: data.user, accessToken: data.access_token });
  },

  register: async (fullName, email, password) => {
    const { data } = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    setAuthToken(data.access_token);
    await SecureStore.setItemAsync('accessToken', data.access_token);
    set({ user: data.user, accessToken: data.access_token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setAuthToken(null);
    set({ user: null, accessToken: null });
  },
}));
