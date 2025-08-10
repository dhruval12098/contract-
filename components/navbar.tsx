"use client"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Moon, Sun, Command, User, Download } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"

const pageTitle: Record<string, string> = {
  "/": "Welcome",
  "/dashboard": "Dashboard",
  "/contracts/client": "Client Contracts",
  "/contracts/hiring": "Hiring Contracts",
  "/wizard": "Contract Wizard",
  "/settings": "Settings",
}

export function Navbar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { agency, logout } = useAuthStore()
  const { handleInstallApp, showInstallPrompt } = usePWAInstall()

  const currentTitle = pageTitle[pathname] || "ContractAI"

  const handleLogout = () => {
    logout()
    window.location.href = "/auth/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger className="-ml-1" />

        <div className="flex-1 flex justify-center">
          <motion.h1
            key={currentTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold"
          >
            {currentTitle}
          </motion.h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Command className="h-4 w-4" />
            <span className="sr-only">Command palette</span>
          </Button>

          {showInstallPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 px-0"
              onClick={handleInstallApp}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="sr-only">Install</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agency?.logo || "/placeholder.svg"} alt={agency?.name} />
                  <AvatarFallback>{agency?.name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{agency?.name || "Agency Name"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{agency?.email || "agency@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
