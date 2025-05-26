"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart, BookOpen, LayoutDashboard, LogOut, Shield, Users,MessageSquare,CloudFog } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// User data interface
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Get user data from localStorage or sessionStorage
    const getUserData = () => {
      if (typeof window !== "undefined") {
        const storedData = localStorage.getItem("userData") || sessionStorage.getItem("userData")
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            setUserData(parsedData)
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        }
      }
    }

    getUserData()
  }, [])

  const handleLogout = async () => {
    try {
      // Call the logout API
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      // Clear user data from storage
      localStorage.removeItem("userToken")
      localStorage.removeItem("userData")
      sessionStorage.removeItem("userToken")
      sessionStorage.removeItem("userData")

      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })

      // Redirect to login page
      router.push("/auth/signin")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Learning Tips",
      href: "/admin/learning/new",
      icon: BookOpen,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
    }
    
  ]

  

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData) return "AD"
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Shield className="h-7 w-7 text-green-600" />
          <span className="text-xl font-bold">Admin Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.name}>
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="h-5 w-5" />
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-green-100 text-green-800">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {userData ? `${userData.firstName} ${userData.lastName}` : "Admin User"}
                </p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
            </div>

          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
