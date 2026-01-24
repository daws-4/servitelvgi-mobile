import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';

interface BandwidthStats {
    wifi: {
        bytesReceived: number;
        bytesSent: number;
        lastUpdated: string;
    };
    mobile: {
        bytesReceived: number;
        bytesSent: number;
        lastUpdated: string;
    };
    sessionStart: string;
}

interface BandwidthState {
    stats: BandwidthStats;
    trackUsage: (bytes: number, type: 'sent' | 'received') => Promise<void>;
    resetStats: () => Promise<void>;
    loadStats: () => Promise<void>;
}

const STORAGE_KEY = 'bandwidth_stats';

const INITIAL_STATS: BandwidthStats = {
    wifi: {
        bytesReceived: 0,
        bytesSent: 0,
        lastUpdated: new Date().toISOString(),
    },
    mobile: {
        bytesReceived: 0,
        bytesSent: 0,
        lastUpdated: new Date().toISOString(),
    },
    sessionStart: new Date().toISOString(),
};

export const useBandwidthStore = create<BandwidthState>((set, get) => ({
    stats: INITIAL_STATS,

    loadStats: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                set({ stats: JSON.parse(stored) });
            }
        } catch (error) {
            console.error('Error loading bandwidth stats:', error);
        }
    },

    trackUsage: async (bytes: number, type: 'sent' | 'received') => {
        const state = await NetInfo.fetch();
        const currentStats = get().stats;
        const now = new Date().toISOString();

        const newStats = { ...currentStats };

        if (state.type === NetInfoStateType.wifi) {
            if (type === 'sent') {
                newStats.wifi.bytesSent += bytes;
            } else {
                newStats.wifi.bytesReceived += bytes;
            }
            newStats.wifi.lastUpdated = now;
        } else if (state.type === NetInfoStateType.cellular) {
            if (type === 'sent') {
                newStats.mobile.bytesSent += bytes;
            } else {
                newStats.mobile.bytesReceived += bytes;
            }
            newStats.mobile.lastUpdated = now;
        }

        set({ stats: newStats });

        // Asynchronously save to storage to avoid blocking
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats)).catch(err =>
            console.error('Error saving bandwidth stats:', err)
        );
    },

    resetStats: async () => {
        const newStats = {
            ...INITIAL_STATS,
            sessionStart: new Date().toISOString(),
        };
        set({ stats: newStats });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    },
}));

// Helper class for non-hook usage (e.g. inside Axios interceptors)
export class BandwidthService {
    static async trackRequest(bytes: number) {
        await useBandwidthStore.getState().trackUsage(bytes, 'sent');
    }

    static async trackResponse(bytes: number) {
        await useBandwidthStore.getState().trackUsage(bytes, 'received');
    }
}
