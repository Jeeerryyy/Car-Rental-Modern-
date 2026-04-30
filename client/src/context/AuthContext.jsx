import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import api from '../services/api';
import socket, { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Handle socket connections based on auth state
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      connectSocket();
      socket.emit('join-owner-room');
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    let cancelled = false;
    api.get('/api/auth/me')
      .then((res) => {
        if (cancelled) return;
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const persist = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = useCallback(async (form) => {
    try {
      const { data } = await api.post('/api/auth/register', form);
      persist(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  }, [persist]);

  const login = useCallback(async (form) => {
    try {
      const { data } = await api.post('/api/auth/login', form);
      persist(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  }, [persist]);

  const ownerLogin = useCallback(async (form) => {
    try {
      const { data } = await api.post('/api/auth/owner-login', form);
      persist(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  }, [persist]);

  const googleLogin = useCallback(async (token) => {
    try {
      const { data } = await api.post('/api/auth/google', { token });
      persist(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Google login failed' };
    }
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, register, login, ownerLogin, googleLogin, logout, updateUser }),
    [user, isAuthenticated, loading, register, login, ownerLogin, googleLogin, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
