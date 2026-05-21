import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { httpClient } from '@/services/api/client';
export interface StatusConfig {
  key: string;
  label: string;
  category: 'pending' | 'in_progress' | 'completed' | 'terminal';
  countsAsCompleted: boolean;
  isTerminal: boolean;
  color: string;
  bgColor: string;
  dotColor: string;
  chipVariant: string;
  borderColor: string;
  icon: string;
  hexColor: string;
  hexBgColor: string;
  order: number;
}

export interface OrderConfigData {
  statuses: Record<string, StatusConfig>;
  completedStatuses: string[];
  terminalStatuses: string[];
  version: string;
}

interface OrderConfigContextProps {
  config: OrderConfigData | null;
  loading: boolean;
  refreshConfig: () => Promise<void>;
  getStatusConfig: (status: string) => StatusConfig;
  validateStatus: (status: string) => boolean;
}

const CACHE_KEY = '@order_config_v1';

export const OrderConfigContext = createContext<OrderConfigContextProps>({
  config: null,
  loading: true,
  refreshConfig: async () => {},
  getStatusConfig: () => ({
    key: 'pending',
    label: 'Pendiente',
    category: 'pending',
    countsAsCompleted: false,
    isTerminal: false,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    dotColor: 'bg-amber-500',
    chipVariant: 'flat',
    borderColor: 'border-amber-200',
    icon: 'clock',
    hexColor: '#ca8a04',
    hexBgColor: '#fef9c3',
    order: 0,
  }),
  validateStatus: () => true,
});

const DEFAULT_MAP: Record<string, Partial<StatusConfig>> = {
  pending: {
    label: 'Pendiente',
    hexColor: '#ca8a04',
    hexBgColor: '#fef9c3',
    countsAsCompleted: false,
  },
};

export const OrderConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<OrderConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback map in case something is wrong
  const defaultMap: Record<string, any> = { ...DEFAULT_MAP };

  useEffect(() => {
    loadCachedConfig();
  }, []);

  const loadCachedConfig = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setConfig(processConfig(parsed));
      }
    } catch (err) {
      console.log('Error loading cached order config', err);
    } finally {
      setLoading(false);
    }
  };

  const processConfig = (data: OrderConfigData) => {
    if (data && data.statuses) {
      let i = 0;
      for (const key in data.statuses) {
        data.statuses[key].key = key;
        data.statuses[key].order = data.statuses[key].order ?? i;
        i++;
      }
    }
    return data;
  };

  const refreshConfig = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/api/web/order-config');

      if (res.data && res.data.data) {
        const processed = processConfig(res.data.data);
        setConfig(processed);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(processed));
        console.log('Order config refreshed and cached.');
      } else {
        console.warn('API order-config devolvió un formato inválido (¿HTML login?).', res.data);
      }
    } catch (err) {
      console.log('Error fetching order config', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string): StatusConfig => {
    if (config?.statuses && config.statuses[status]) {
      return config.statuses[status];
    }
    // Fallback if not found
    if (defaultMap[status]) return defaultMap[status] as StatusConfig;

    // Extreme fallback
    return {
      key: status,
      label: 'Estado No Registrado',
      category: 'terminal',
      countsAsCompleted: false,
      isTerminal: false,
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      dotColor: 'bg-gray-600',
      chipVariant: 'flat',
      borderColor: 'border-gray-300',
      icon: 'help-circle-outline',
      hexColor: '#111827',
      hexBgColor: '#f3f4f6',
      order: 999,
    };
  };

  const validateStatus = (status: string) => {
    if (config?.statuses) {
      return !!config.statuses[status];
    }
    return !!defaultMap[status];
  };

  return (
    <OrderConfigContext.Provider
      value={{ config, loading, refreshConfig, getStatusConfig, validateStatus }}>
      {children}
    </OrderConfigContext.Provider>
  );
};

export const useOrderConfig = () => useContext(OrderConfigContext);
