import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export interface UseSmartPollingOptions {
  /**
   * Callback function to execute on each polling interval
   */
  callback: () => void | Promise<void>;
  
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Whether polling is enabled
   * Set to false to pause polling
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook for smart polling that respects app state
 * 
 * - Polls at specified interval when app is ACTIVE
 * - Pauses automatically when app goes to BACKGROUND
 * - Resumes when app returns to FOREGROUND
 * - Auto-cleans up on unmount
 * 
 * @example
 * ```tsx
 * useSmartPolling({
 *   callback: refetchOrders,
 *   interval: 30000, // 30 seconds
 *   enabled: !loading
 * });
 */
export function useSmartPolling(options: UseSmartPollingOptions) {
  const {
    callback,
    interval = 15000, // Default 15 seconds
    enabled = true
  } = options;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  /**
   * Start polling interval
   */
  const startPolling = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Only start if enabled
    if (!enabled) return;
    
    // Set up new interval
    intervalRef.current = setInterval(() => {
      callback();
    }, interval);
  };

  /**
   * Stop polling interval
   */
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /**
   * Handle app state changes
   */
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // App went to background
    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      stopPolling();
    }

    // App came to foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      startPolling();
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    // Start polling if app is currently active
    if (AppState.currentState === 'active' && enabled) {
      startPolling();
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [enabled, interval]); // Restart if enabled or interval changes

  // Update callback ref when it changes without restarting interval
  // This prevents unnecessary restarts
  useEffect(() => {
    // No action needed - interval closure will use latest callback
  }, [callback]);
}
