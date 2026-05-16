import { createContext, useContext, useState, useCallback } from 'react';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);

  const customerLogin = useCallback(async (email, password) => {
    const { default: customerApi } = await import('../api/public/customerApi.js');
    try {
      const response = await customerApi.login({ email, password });
      const data = response.data;
      if (data.needsVerification) {
        return { success: false, needsVerification: true, email: data.email, error: data.error };
      }
      if (data.success && data.customer) {
        setCustomer(data.customer);
      }
      return { success: data.success, user: data.customer };
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        return { success: false, needsVerification: true, email: err.response.data.email, error: err.response.data.error };
      }
      return { success: false, error: err.message };
    }
  }, []);

  const customerSignup = useCallback(async (name, email, password, phone) => {
    const { default: customerApi } = await import('../api/public/customerApi.js');
    try {
      const response = await customerApi.signup({ name, email, password, phone });
      const data = response.data;
      return { success: true, needsVerification: true, email: data.email, message: data.message };
    } catch (err) {
      return { success: false, error: err.message, passwordErrors: err.response?.data?.passwordErrors };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const { default: customerApi } = await import('../api/public/customerApi.js');
    try {
      const response = await customerApi.verifyOtp({ email, otp });
      const data = response.data;
      if (data.success && data.customer) {
        setCustomer(data.customer);
      }
      return { success: true, user: data.customer };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resendOtp = useCallback(async (email) => {
    const { default: customerApi } = await import('../api/public/customerApi.js');
    try {
      const response = await customerApi.resendOtp({ email });
      return { success: true, message: response.data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const customerLogout = useCallback(async () => {
    const { default: customerApi } = await import('../api/public/customerApi.js');
    try { await customerApi.logout(); } catch { /* ignore */ }
    setCustomer(null);
  }, []);

  const setCustomerData = useCallback((newData) => {
    setCustomer(newData);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      customerLogin, customerSignup, customerLogout, setCustomerData,
      verifyOtp, resendOtp,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);