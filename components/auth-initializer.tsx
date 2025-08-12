'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function AuthInitializer() {
  const { checkAuth, isHydrated } = useAuthStore();
  const { isOnline } = useNetworkStatus();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isHydrated && !hasInitialized && isOnline) {
      setHasInitialized(true);
      
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        checkAuth().catch((error) => {
          console.error('Auth initialization failed:', error);
          // Don't throw the error, just log it to prevent app crashes
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [checkAuth, isHydrated, hasInitialized, isOnline]);

  // Listen for network reconnection to retry auth
  useEffect(() => {
    const handleNetworkReconnected = () => {
      if (isHydrated && hasInitialized) {
        console.log('Network reconnected, retrying auth...');
        checkAuth().catch((error) => {
          console.error('Auth retry after reconnection failed:', error);
        });
      }
    };

    window.addEventListener('network-reconnected', handleNetworkReconnected);
    
    return () => {
      window.removeEventListener('network-reconnected', handleNetworkReconnected);
    };
  }, [checkAuth, isHydrated, hasInitialized]);

  return null;
}