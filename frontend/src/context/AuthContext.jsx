import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AUTH_SESSION_EXPIRED_EVENT, authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      return token && stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    if (!data?.token || !data?.user) {
      throw new Error('Login did not return a valid session. Check that the frontend is connected to the deployed API.');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (email, password) => {
    const { data } = await authApi.register({ email, password });
    if (!data?.token || !data?.user) {
      throw new Error('Registration did not return a valid session. Check that the frontend is connected to the deployed API.');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
