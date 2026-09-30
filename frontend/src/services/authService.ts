import { apiClient } from './apiClient';
import { setAuthToken, setStoredUser, removeAuthToken } from '../utils/token';
import type { User } from '../types';

export const authService = {
  async register(name: string, email: string, password: string, targetRoles?: string[]) {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/register', {
      name,
      email,
      password,
      targetRoles
    });
    if (res.data?.token && res.data?.user) {
      setAuthToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/login', {
      email,
      password
    });
    if (res.data?.token && res.data?.user) {
      setAuthToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res.data;
  },

  async getCurrentUser() {
    const res = await apiClient.get<User>('/auth/me');
    if (res.data) {
      setStoredUser(res.data);
    }
    return res.data;
  },

  logout() {
    removeAuthToken();
  }
};
