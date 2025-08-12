'use client'

import { useNetworkStatus } from '@/hooks/use-network-status';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {!isOnline ? (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      ) : wasOffline ? (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Connection restored! Syncing data...
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}