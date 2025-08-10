"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"

const authPages = ["/auth/login", "/auth/register", "/client"]

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if current page is an auth page or client page
  const isAuthPage = authPages.some((page) => pathname === page || pathname.startsWith("/client/"))

  if (isAuthPage) {
    // For auth pages and client pages, render without sidebar/navbar
    return <main className="min-h-screen w-full">{children}</main>
  }

  // For dashboard pages, render with sidebar and navbar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
