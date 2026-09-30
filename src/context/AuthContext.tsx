import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { getAuthToken, setAuthToken, removeAuthToken, getStoredUser, setStoredUser } from '../utils/token';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, targetRoles?: string[]) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getAuthToken();
    const savedUser = getStoredUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      apiClient.get<User>('/auth/me').then(res => {
        if (res.data) {
          setUser(res.data);
          setStoredUser(res.data);
        }
      }).catch(() => {
        removeAuthToken();
        setToken(null);
        setUser(null);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (res.data) {
      const { user: u, token: t } = res.data;
      setAuthToken(t);
      setStoredUser(u);
      setToken(t);
      setUser(u);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, targetRoles?: string[]) => {
    const res = await apiClient.post<{ user: User; token: string }>('/auth/register', { name, email, password, targetRoles });
    if (res.data) {
      const { user: u, token: t } = res.data;
      setAuthToken(t);
      setStoredUser(u);
      setToken(t);
      setUser(u);
    }
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
