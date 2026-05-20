import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ownerLogin, ownerRegister, ownerLogout, getOwnerMe } from '../api/auth.js';

const OwnerAuthContext = createContext(null);

function hasOwnerCookie() {
  return document.cookie.split(';').some(c => c.trim().startsWith('ownerToken='));
}

export function OwnerAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('owner');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('owner') || hasOwnerCookie());

  useEffect(() => {
    if (hasOwnerCookie() && !localStorage.getItem('owner')) {
      getOwnerMe()
        .then(res => {
          const owner = res.data.data?.owner || res.data.owner;
          if (owner) {
            localStorage.setItem('owner', JSON.stringify(owner));
            setUser(owner);
          }
        })
        .catch(() => {
          document.cookie = 'ownerToken=; Max-Age=0; path=/';
          localStorage.removeItem('owner');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await ownerLogin({ email, password });
    const { owner } = res.data.data;
    localStorage.setItem('owner', JSON.stringify(owner));
    setUser(owner);
    return owner;
  }, []);

  const register = useCallback(async (data) => {
    const res = await ownerRegister(data);
    const { owner } = res.data.data;
    localStorage.setItem('owner', JSON.stringify(owner));
    setUser(owner);
    return owner;
  }, []);

  const logout = useCallback(async () => {
    try { await ownerLogout(); } catch {}
    localStorage.removeItem('owner');
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('owner', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <OwnerAuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      checkAuth: () => getOwnerMe(),
    }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isOwner: true,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      updateUser: () => {},
      checkAuth: async () => {},
    };
  }
  return { ...ctx, isOwner: true };
}
