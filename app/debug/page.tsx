'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testSupabaseConnection, checkEnvironmentVariables } from '@/lib/supabase-test';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useAuthStore } from '@/store/auth-store';

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [envCheck, setEnvCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { isAuthenticated, agency, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    // Check environment variables on load
    setEnvCheck(checkEnvironmentVariables());
  }, []);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: `Test failed: ${(error as Error).message}`,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>
        <Badge variant={isOnline ? "default" : "destructive"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Checking if Supabase configuration is properly set
          </CardDescription>
        </CardHeader>
        <CardContent>
          {envCheck && (
            <div className="space-y-2">
              <Badge variant={envCheck.success ? "default" : "destructive"}>
                {envCheck.success ? "✓ Configured" : "✗ Issues Found"}
              </Badge>
              <p className="text-sm text-muted-foreground">{envCheck.message}</p>
              {envCheck.details && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(envCheck.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            Test the connection to Supabase services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runConnectionTest} 
            disabled={isLoading || !isOnline}
          >
            {isLoading ? "Testing..." : "Run Connection Test"}
          </Button>
          
          {connectionTest && (
            <div className="space-y-2">
              <Badge variant={connectionTest.success ? "default" : "destructive"}>
                {connectionTest.success ? "✓ Connected" : "✗ Connection Failed"}
              </Badge>
              <p className="text-sm text-muted-foreground">{connectionTest.message}</p>
              {connectionTest.details && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(connectionTest.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            Current authentication state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {authLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            
            {agency && (
              <div className="space-y-1">
                <p className="text-sm"><strong>Agency:</strong> {agency.name}</p>
                <p className="text-sm"><strong>Email:</strong> {agency.email}</p>
                <p className="text-sm"><strong>ID:</strong> {agency.id}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
          <CardDescription>
            Current network connectivity information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Connection:</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
          <CardDescription>
            Common solutions for connection issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>If you see "Failed to fetch" errors:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Check your internet connection</li>
                <li>Verify Supabase URL and API key are correct</li>
                <li>Check if your Supabase project is active</li>
                <li>Try refreshing the page</li>
                <li>Clear browser cache and localStorage</li>
              </ul>
            </div>
            
            <div>
              <strong>If authentication keeps failing:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Check if RLS (Row Level Security) is properly configured</li>
                <li>Verify the agencies table exists and has proper permissions</li>
                <li>Check Supabase dashboard for any service issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}