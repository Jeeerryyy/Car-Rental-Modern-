import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem('customer');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get profile on load to check if cookie is valid
    authAPI.getProfile()
      .then(res => {
        setCustomer(res.data.data.customer);
        localStorage.setItem('customer', JSON.stringify(res.data.data.customer));
      })
      .catch(() => {
        localStorage.removeItem('customer');
        localStorage.removeItem('customerToken');
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { customer: cust, token } = res.data.data;
    localStorage.setItem('customer', JSON.stringify(cust));
    localStorage.setItem('customerToken', token);
    setCustomer(cust);
    return cust;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await authAPI.googleAuth(credential);
    const { customer: cust, token } = res.data.data;
    localStorage.setItem('customer', JSON.stringify(cust));
    localStorage.setItem('customerToken', token);
    setCustomer(cust);
    return cust;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { customer: cust, token } = res.data.data;
    localStorage.setItem('customer', JSON.stringify(cust));
    localStorage.setItem('customerToken', token);
    setCustomer(cust);
    return cust;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('customer');
    localStorage.removeItem('customerToken');
    setCustomer(null);
  }, []);

  const updateCustomer = useCallback((data) => {
    setCustomer(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('customer', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ customer, loading, login, loginWithGoogle, register, logout, updateCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
