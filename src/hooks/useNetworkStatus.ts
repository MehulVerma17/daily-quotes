/**
 * useNetworkStatus Hook
 *
 * Custom hook for detecting network connectivity status.
 * Uses fetch-based check for Expo Go compatibility.
 */

import { useEffect, useState, useCallback } from 'react';

interface NetworkStatus {
  isConnected: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a small, reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsConnected(response.ok || response.status === 204);
    } catch (error) {
      // Network error or timeout - likely offline
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Check immediately
    checkConnection();

    // Poll every 10 seconds
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  return { isConnected };
};

export default useNetworkStatus;
