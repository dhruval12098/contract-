"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, FileText, Users, Settings, Plus, ChevronRight, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Client Contracts",
    url: "/contracts/client",
    icon: FileText,
  },
  {
    title: "Hiring Contracts",
    url: "/contracts/hiring",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const quickActions = [
  {
    title: "New Client Contract",
    url: "/wizard?type=client",
    icon: Plus,
  },
  {
    title: "New Hiring Contract",
    url: "/wizard?type=hiring",
    icon: Plus,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { agency, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = "/auth/login"
  }

  return (
    <Sidebar variant="inset" className="bg-white" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={agency?.logo || "/placeholder.svg"} alt={agency?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {agency?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{agency?.name || "ContractAI"}</span>
            <span className="truncate text-xs text-muted-foreground">Smart Contracts</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Product by <span className="font-semibold text-primary">Drimin AI</span>
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}