import { useBandwidthStore } from '../services/bandwidthService';

export function useBandwidthStats() {
    const stats = useBandwidthStore((state) => state.stats);
    const resetStats = useBandwidthStore((state) => state.resetStats);
    const loadStats = useBandwidthStore((state) => state.loadStats);
    const updateStats = useBandwidthStore((state) => state.updateStats);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const wifiTotal = stats.wifi.bytesReceived + stats.wifi.bytesSent;
    const mobileTotal = stats.mobile.bytesReceived + stats.mobile.bytesSent;
    const totalUsage = wifiTotal + mobileTotal;

    return {
        stats,
        resetStats,
        loadStats,
        updateStats,
        wifiUsage: {
            sent: stats.wifi.bytesSent,
            received: stats.wifi.bytesReceived,
            total: wifiTotal,
            formattedTotal: formatBytes(wifiTotal),
        },
        mobileUsage: {
            sent: stats.mobile.bytesSent,
            received: stats.mobile.bytesReceived,
            total: mobileTotal,
            formattedTotal: formatBytes(mobileTotal),
        },
        totalUsage: {
            bytes: totalUsage,
            formatted: formatBytes(totalUsage),
        },
        formatBytes,
    };
}
