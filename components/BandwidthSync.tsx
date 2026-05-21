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
    // DISABLED: Automatic polling disabled by request
    // const stopPolling = startBandwidthPolling(idToSync);

    return () => {
      // stopPolling();
    };
  }, [isAuthenticated, installer?._id]);

  return null;
}
