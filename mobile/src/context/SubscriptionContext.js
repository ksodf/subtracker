import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { subscriptionApi } from '../api/client';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { token, logout } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setSubscriptions([]);
        setSummary(null);
        setError('');
        return;
      }

      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await subscriptionApi.getAll(token, currency);
        setSubscriptions(data?.subscriptions || []);
        setSummary(data?.summary || null);
        setError('');
      } catch (err) {
        if (err.status === 401) {
          await logout();
          setError('Your session expired. Please sign in again.');
        } else {
          setError(err.message || 'Failed to load subscriptions.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currency, logout, token]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSubscription = useCallback(
    async (payload) => {
      const created = await subscriptionApi.create(token, payload);
      await refresh({ silent: true });
      return created;
    },
    [refresh, token]
  );

  const deleteSubscription = useCallback(
    async (id) => {
      await subscriptionApi.remove(token, id);
      await refresh({ silent: true });
    },
    [refresh, token]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      subscriptions,
      summary,
      loading,
      refreshing,
      error,
      refresh,
      createSubscription,
      deleteSubscription,
    }),
    [
      createSubscription,
      currency,
      deleteSubscription,
      error,
      loading,
      refresh,
      refreshing,
      subscriptions,
      summary,
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscriptions() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error('useSubscriptions must be used inside SubscriptionProvider');
  return value;
}
