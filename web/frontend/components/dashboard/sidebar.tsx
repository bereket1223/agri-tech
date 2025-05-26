"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Cloud, FileSpreadsheet, Home, Leaf, LogOut, Search, Thermometer, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

// Define the structure for navigation and searchable content
type NavigationItem = {
  title: string
  icon: React.ElementType
  href: string
  keywords?: string[] // Additional keywords for search
  description?: string // Optional description for search results
}

// User data interface
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<NavigationItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Get user data from localStorage or sessionStorage
  useEffect(() => {
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

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include", // Include cookies if using cookie-based auth
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Clear storage
        localStorage.removeItem("userToken")
        localStorage.removeItem("userData")
        sessionStorage.removeItem("userToken")
        sessionStorage.removeItem("userData")

        // Show toast
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        })

        // Redirect to home page
        router.push("/")
      } else {
        // Handle error response
        toast({
          title: "Logout failed",
          description: "There was a problem logging out. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Extended navigation items with additional searchable content
  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      keywords: ["home", "overview", "summary", "main", "stats"],
      description: "Main dashboard with overview of agricultural data",
    },
    {
      title: "Crop Recommendation",
      icon: Leaf,
      href: "/dashboard/crop-recommendation",
      keywords: ["crops", "plants", "farming", "recommendation", "suggestion", "advice", "teff", "maize", "sorghum"],
      description: "Get personalized crop recommendations based on conditions",
    },
    {
      title: "Learning Tips",
      icon: BookOpen,
      href: "/dashboard/learning",
      keywords: ["education", "tips", "guides", "tutorials", "learn", "knowledge", "farming practices"],
      description: "Educational resources and farming best practices",
    },
    {
      title: "Weather Forecast",
      icon: Cloud,
      href: "/dashboard",
      keywords: ["weather", "forecast", "climate", "rain", "temperature", "humidity", "conditions"],
      description: "Weather forecasts and climate data for agricultural planning",
    },
    {
      title: "Irrigation Guide",
      icon: Thermometer,
      href: "/dashboard",
      keywords: ["water", "irrigation", "drip", "sprinkler", "watering", "moisture"],
      description: "Irrigation techniques and water management guides",
    },
    {
      title: "Soil Analysis",
      icon: FileSpreadsheet,
      href: "/dashboard",
      keywords: ["soil", "analysis", "fertility", "nutrients", "ph", "composition"],
      description: "Soil health analysis and improvement recommendations",
    },
  ]

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const lowerCaseQuery = query.toLowerCase()

    const results = navigationItems.filter((item) => {
      // Search in title
      if (item.title.toLowerCase().includes(lowerCaseQuery)) {
        return true
      }

      // Search in keywords
      if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerCaseQuery))) {
        return true
      }

      // Search in description
      if (item.description?.toLowerCase().includes(lowerCaseQuery)) {
        return true
      }

      return false
    })

    setSearchResults(results)
  }

  // Update search results when query changes
  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery])

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  // Generate avatar fallback from user's initials
  const getInitials = () => {
    if (!userData) return "U"
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-3 py-2">
          <Leaf className="h-7 w-7 text-green-600" />
          <span className="text-xl font-bold">AgriPredict</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-gray-100 pl-9 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results ({searchResults.length})</h3>
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={clearSearch}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.description && <p className="text-xs text-gray-500 mt-1 ml-6">{item.description}</p>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-2">No results found</p>
            )}
            <SidebarSeparator className="my-2" />
          </div>
        )}

        <SidebarMenu>
          {/* Only show the main navigation when not searching */}
          {!isSearching &&
            navigationItems.slice(0, 3).map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-5 w-5" />
                    <span className="ml-2">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
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
                  {userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."}
                </p>
            
              </div>
            </div>
           
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
