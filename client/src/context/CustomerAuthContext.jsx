import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get('/customer/me');
      setCustomer(res.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data) => {
    const res = await axiosInstance.post('/customer/auth/login', data);
    setCustomer(res.data.data);
    setIsAuthenticated(true);
    return res.data;
  };

  const register = async (data) => {
    const res = await axiosInstance.post('/customer/auth/register', data);
    return res.data;
  };

  const logout = async () => {
    await axiosInstance.post('/customer/auth/logout');
    setCustomer(null);
    setIsAuthenticated(false);
  };

  const updateCustomer = (data) => {
    setCustomer(prev => ({ ...prev, ...data }));
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, isAuthenticated, isLoading, login, register, logout, updateCustomer, checkAuth }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);