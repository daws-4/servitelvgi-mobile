import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';
import { NativeModules, Platform } from 'react-native';
import { bandwidthApi } from './api/bandwidth';

const { BandwidthModule } = NativeModules;

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
    // Checkpoint for sync
    synced: {
        wifiTotal: number;
        mobileTotal: number;
        lastSyncTime: string;
    };
    sessionStart: string;
    // Internal state for delta calculation
    lastNativeRx: number;
    lastNativeTx: number;
}

interface BandwidthState {
    stats: BandwidthStats;
    initTracking: () => Promise<void>;
    updateStats: () => Promise<void>;
    resetStats: () => Promise<void>;
    loadStats: () => Promise<void>;
    syncToBackend: (installerId: string) => Promise<void>;
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
    synced: {
        wifiTotal: 0,
        mobileTotal: 0,
        lastSyncTime: new Date().toISOString(),
    },
    sessionStart: new Date().toISOString(),
    lastNativeRx: 0,
    lastNativeTx: 0,
};

export const useBandwidthStore = create<BandwidthState>((set, get) => ({
    stats: INITIAL_STATS,

    loadStats: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure structure compatibility with merge, especially for new 'synced' field
                set({
                    stats: {
                        ...INITIAL_STATS,
                        ...parsed,
                        // If stored stats didn't have synced, default it (effectively 0)
                        synced: parsed.synced || INITIAL_STATS.synced
                    }
                });
            }
        } catch (error) {
            console.error('Error loading bandwidth stats:', error);
        }
    },

    initTracking: async () => {
        if (Platform.OS !== 'android' || !BandwidthModule) return;

        try {
            // Initialize baseline values without adding usage
            const nativeStats = await BandwidthModule.getTotalBytes();
            const currentStats = get().stats;

            set({
                stats: {
                    ...currentStats,
                    lastNativeRx: nativeStats.rx,
                    lastNativeTx: nativeStats.tx
                }
            });
            console.log('Bandwidth tracking initialized', nativeStats);
        } catch (e) {
            console.warn('Failed to init bandwidth tracking', e);
        }
    },

    updateStats: async () => {
        if (Platform.OS !== 'android' || !BandwidthModule) return;

        try {
            const nativeStats = await BandwidthModule.getTotalBytes();
            const state = await NetInfo.fetch();
            const currentStats = get().stats;
            const now = new Date().toISOString();

            // Calculate deltas
            // Handle restarts: if new < old, device restarted. Treat new as full delta from 0 (approx) or 0 delta.
            // TrafficStats resets on boot.
            let deltaRx = nativeStats.rx - currentStats.lastNativeRx;
            let deltaTx = nativeStats.tx - currentStats.lastNativeTx;

            if (deltaRx < 0 || deltaTx < 0) {
                // Device likely restarted or counters wrapped. 
                // We accept the current absolute value as usage (if close to 0 start) or ignore outlier.
                // Safer strategy: if significant drop, assume reset and count from 0 next time.
                console.log('Bandwidth counters reset detected');
                deltaRx = 0;
                deltaTx = 0;
            }

            const newStats = { ...currentStats };

            // Update totals in store (native values for next delta)
            newStats.lastNativeRx = nativeStats.rx;
            newStats.lastNativeTx = nativeStats.tx;

            if (deltaRx > 0 || deltaTx > 0) {
                if (state.type === NetInfoStateType.wifi) {
                    newStats.wifi.bytesReceived += deltaRx;
                    newStats.wifi.bytesSent += deltaTx;
                    newStats.wifi.lastUpdated = now;
                } else if (state.type === NetInfoStateType.cellular) {
                    newStats.mobile.bytesReceived += deltaRx;
                    newStats.mobile.bytesSent += deltaTx;
                    newStats.mobile.lastUpdated = now;
                }
                // Save and update state
                set({ stats: newStats });
                AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats)).catch(console.error);
            }

        } catch (e) {
            console.warn('Error updating bandwidth stats', e);
        }
    },

    resetStats: async () => {
        // We need to keep the lastNative values to calculate deltas correctly after reset
        const currentStats = get().stats;

        const newStats = {
            ...INITIAL_STATS,
            lastNativeRx: currentStats.lastNativeRx,
            lastNativeTx: currentStats.lastNativeTx,
            sessionStart: new Date().toISOString(),
        };

        set({ stats: newStats });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    },

    syncToBackend: async (installerId: string) => {
        const { stats } = get();

        // Calculate accrued deltas since last sync
        const currentWifiTotal = stats.wifi.bytesReceived + stats.wifi.bytesSent;
        const currentMobileTotal = stats.mobile.bytesReceived + stats.mobile.bytesSent;

        const deltaWifi = currentWifiTotal - stats.synced.wifiTotal;
        const deltaMobile = currentMobileTotal - stats.synced.mobileTotal;

        // Threshold to avoid spamming tiny updates (e.g. < 1KB)
        if (deltaWifi < 1024 && deltaMobile < 1024) {
            return;
        }

        try {
            console.log(`Syncing bandwidth... Delta Wifi: ${deltaWifi}, Delta Mobile: ${deltaMobile}`);

            // 1. Get today's range
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // 2. Check existing record
            const history = await bandwidthApi.getDataUsage(
                installerId,
                startOfDay.toISOString(),
                endOfDay.toISOString()
            );

            const todayRecord = history.length > 0 ? history[0] : null;

            if (todayRecord && todayRecord._id) {
                // UPDATE
                // Server stores strings. Parse, add delta, stringify.
                const serverWifi = parseFloat(todayRecord.WifiData) || 0;
                const serverMobile = parseFloat(todayRecord.MobileData) || 0;

                const newWifi = serverWifi + deltaWifi;
                const newMobile = serverMobile + deltaMobile;

                await bandwidthApi.updateDataUsage(todayRecord._id, installerId, newWifi, newMobile);
                console.log('Bandwidth updated (PUT)');
            } else {
                // CREATE
                // If no record exists for today, we create one with the DELTA.
                // NOTE: If this is the first sync of the day, delta is the usage so far today (assuming resetting worked or day logic is handled elsewhere).
                // Currently we just sync "usage since last sync".
                await bandwidthApi.createDataUsage(installerId, deltaWifi, deltaMobile);
                console.log('Bandwidth created (POST)');
            }

            // 3. Update checkpoint on success
            const newStats = {
                ...stats,
                synced: {
                    wifiTotal: currentWifiTotal,
                    mobileTotal: currentMobileTotal,
                    lastSyncTime: new Date().toISOString()
                }
            };

            set({ stats: newStats });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));

        } catch (error) {
            console.error('Failed to sync bandwidth:', error);
        }
    }
}));


/**
 * Helper to start automatic polling only when necessary
 * Can be called from a top-level component
 */
export const startBandwidthPolling = (installerId?: string, intervalMs = 60000) => {
    const store = useBandwidthStore.getState();
    store.loadStats().then(() => store.initTracking());

    const interval = setInterval(async () => {
        await useBandwidthStore.getState().updateStats();
        if (installerId) {
            await useBandwidthStore.getState().syncToBackend(installerId);
        }
    }, intervalMs);

    return () => clearInterval(interval);
};
