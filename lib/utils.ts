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
