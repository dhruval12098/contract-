'use client'

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function AuthInitializer() {
  const { checkAuth, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      checkAuth();
    }
  }, [checkAuth, isHydrated]);

  return null;
}