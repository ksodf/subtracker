import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'subtracker:token';
const USER_KEY = 'subtracker:user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const [[, storedToken], [, storedUser]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (!mounted) return;
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const saveSession = useCallback(async (session) => {
    if (!session?.token || !session?.user) {
      throw new Error('The API did not return a valid session.');
    }

    await AsyncStorage.multiSet([
      [TOKEN_KEY, session.token],
      [USER_KEY, JSON.stringify(session.user)],
    ]);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const session = await authApi.login({ email: email.trim(), password });
      await saveSession(session);
    },
    [saveSession]
  );

  const register = useCallback(
    async (email, password) => {
      const session = await authApi.register({ email: email.trim(), password });
      await saveSession(session);
    },
    [saveSession]
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [initializing, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
