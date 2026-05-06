import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken, refreshToken) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ accessToken, refreshToken });
      },

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        get().setTokens(data.access_token, data.refresh_token);
        const me = await axios.get('/auth/me');
        set({ user: me.data });
        return me.data;
      },

      register: async (email, password, full_name) => {
        const { data } = await axios.post('/auth/register', { email, password, full_name });
        get().setTokens(data.access_token, data.refresh_token);
        const me = await axios.get('/auth/me');
        set({ user: me.data });
        return me.data;
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, refreshToken: null });
      },

      hydrate: () => {
        const { accessToken } = get();
        if (accessToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }) }
  )
);

export default useAuthStore;
