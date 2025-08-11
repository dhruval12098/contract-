import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CommandPaletteProvider } from "@/components/command-palette-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner"
import { AuthLayoutWrapper } from "@/components/auth-layout-wrapper"
import { AuthInitializer } from "@/components/auth-initializer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ContractAI - Smart Contract Generator",
  description: "Generate professional contracts with AI assistance - Product by Drimin AI",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ContractAI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/placeholder-logo.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/placeholder-logo.png", sizes: "152x152", type: "image/png" },
      { url: "/placeholder-logo.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: { 
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ContractAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange forcedTheme="light">
            <CommandPaletteProvider>
              <AuthInitializer />
               <Toaster position="top-right" />
               <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
            </CommandPaletteProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
