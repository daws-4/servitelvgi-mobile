import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { startBandwidthPolling } from '@/services/bandwidthService';

/**
 * Component to manage bandwidth polling lifecycle
 * Should be rendered inside AuthProvider
 */
export function BandwidthSync() {
    const { installer, isAuthenticated } = useAuth();

    useEffect(() => {
        // Only start polling if authenticated, but we can track anonymously too if needed.
        // For sync, we need installerId.
        const idToSync = isAuthenticated ? installer?._id : undefined;

        // Start polling (interval 60s)
        // Disable sync for now as requested by user
        const stopPolling = startBandwidthPolling(undefined /* idToSync */);

        return () => stopPolling();
    }, [isAuthenticated, installer?._id]);

    return null;
}
