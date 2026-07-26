'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, APIResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await api.get<APIResponse<User>>('/auth/me');
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const response = await api.post<APIResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password: pass,
    });

    if (response.data.success && response.data.data) {
      const { token: newToken, user: userData } = response.data.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const response = await api.post<APIResponse<{ token: string; user: User }>>('/auth/register', {
      name,
      email,
      password: pass,
      phone,
    });

    if (response.data.success && response.data.data) {
      const { token: newToken, user: userData } = response.data.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
