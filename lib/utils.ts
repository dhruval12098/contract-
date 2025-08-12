import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  // For client-side, get the current origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // For server-side, use environment variable or default
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

export function getDynamicPort() {
  if (typeof window !== "undefined") {
    return window.location.port || "3000"
  }
  return process.env.PORT || "3000"
}

// Network connectivity utilities
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  const networkErrorPatterns = [
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
    'fetch is not defined',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'NETWORK_ERROR',
    'Connection failed'
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function isSupabaseError(error: any): boolean {
  return error && (error.code || error.status || error.message);
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Only retry on network errors
      if (!isNetworkError(error)) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export function checkOnlineStatus(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}
