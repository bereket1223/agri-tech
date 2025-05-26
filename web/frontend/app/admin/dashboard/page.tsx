"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, Clock, Lightbulb, Calendar, CalendarDays, CalendarClock, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import AdminWeatherWidget from "@/components/admin/weather-widget"
import DailyTip from "@/components/admin/daily-tip"
import UserManagement from "@/components/admin/user-management"

// User data interface
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  isAdmin: boolean
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    weekUsers: 0,
    monthUsers: 0,
  })
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get user data from localStorage or sessionStorage
    const getUserData = () => {
      if (typeof window !== "undefined") {
        const storedData = localStorage.getItem("userData") || sessionStorage.getItem("userData")
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)

            // Check if user is admin, if not redirect to regular dashboard
            if (!parsedData.isAdmin) {
              toast({
                title: "Access denied",
                description: "You don't have permission to access the admin dashboard.",
                variant: "destructive",
              })
              router.push("/dashboard")
              return
            }

            setUserData(parsedData)
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        } else {
          // No user data found, redirect to login
          toast({
            title: "Authentication required",
            description: "Please log in to access the admin dashboard.",
            variant: "destructive",
          })
          router.push("/auth/signin")
        }
      }
    }

    getUserData()
  }, [router, toast])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get token from storage
        const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

        if (!token) {
          console.error("No authentication token found")
          return
        }

        const res = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch users")
        }

        const users: User[] = await res.json()

        // Calculate time-based statistics
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const todayUsers = users.filter((user) => new Date(user.createdAt) >= oneDayAgo).length
        const weekUsers = users.filter((user) => new Date(user.createdAt) >= oneWeekAgo).length
        const monthUsers = users.filter((user) => new Date(user.createdAt) >= oneMonthAgo).length

        setStats({
          totalUsers: users.length,
          todayUsers,
          weekUsers,
          monthUsers,
        })
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
      }
    }

    fetchStats()
  }, [router])

  const handleLogout = async () => {
    try {
      // Get token from storage
      const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

      if (!token) {
        console.error("No authentication token found")
        return
      }

      const res = await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to logout")
      }

      // Clear user data and token from storage
      localStorage.removeItem("userData")
      localStorage.removeItem("userToken")
      sessionStorage.removeItem("userData")
      sessionStorage.removeItem("userToken")

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })

      // Redirect to login page
      router.push("/")
    } catch (err) {
      console.error("Failed to logout:", err)
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Welcome back, {userData ? userData.firstName : "Admin"}</h1>
          <p className="text-gray-600">Monitor system activity and manage users.</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Link href="/admin/users">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white mr-2">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/learning/new">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Lightbulb className="mr-2 h-4 w-4" />
              Add Learning Tip
            </Button>
          </Link>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Today's Users</p>
                <p className="text-3xl font-bold text-green-900">{stats.todayUsers}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">This Week</p>
                <p className="text-3xl font-bold text-purple-900">{stats.weekUsers}</p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <CalendarDays className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">This Month</p>
                <p className="text-3xl font-bold text-amber-900">{stats.monthUsers}</p>
              </div>
              <div className="bg-amber-200 p-3 rounded-full">
                <CalendarClock className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              User Registration Trends
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Registration Growth</h4>
                <div className="text-2xl font-bold">
                  {stats.monthUsers > 0 ? `+${Math.round((stats.weekUsers / stats.monthUsers) * 100)}%` : "0%"}
                </div>
                <p className="text-sm text-gray-500">compared to last month</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Weekly Average</h4>
                <div className="text-2xl font-bold">{Math.round(stats.monthUsers / 4)}</div>
                <p className="text-sm text-gray-500">users per week</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Daily Average</h4>
                <div className="text-2xl font-bold">{Math.round(stats.weekUsers / 7)}</div>
                <p className="text-sm text-gray-500">users per day</p>
              </div>
            </div>

            <div className="h-[200px] flex items-end justify-between mt-8 px-2">
              {/* Simple bar chart visualization */}
              <div className="flex flex-col items-center">
                <div
                  className="w-16 bg-green-200 rounded-t-md"
                  style={{ height: `${(stats.todayUsers / Math.max(stats.monthUsers, 1)) * 150}px` }}
                ></div>
                <p className="mt-2 text-xs font-medium">Today</p>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-16 bg-purple-200 rounded-t-md"
                  style={{ height: `${(stats.weekUsers / Math.max(stats.monthUsers, 1)) * 150}px` }}
                ></div>
                <p className="mt-2 text-xs font-medium">This Week</p>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-16 bg-amber-200 rounded-t-md"
                  style={{ height: `${(stats.monthUsers / Math.max(stats.monthUsers, 1)) * 150}px` }}
                ></div>
                <p className="mt-2 text-xs font-medium">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
              Daily Admin Tip
            </CardTitle>
            <CardDescription>Helpful tips to improve your workflow</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <DailyTip />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.todayUsers > 0 ? (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stats.todayUsers} new users registered today</p>
                      <p className="text-xs text-gray-500">View details in user management</p>
                    </div>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">No new users registered today</p>
                      <p className="text-xs text-gray-500">Check back later</p>
                    </div>
                  </div>
                </div>
              )}

              {stats.weekUsers > stats.todayUsers && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.weekUsers - stats.todayUsers} users registered earlier this week
                      </p>
                      <p className="text-xs text-gray-500">View details in user management</p>
                    </div>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}

              {stats.monthUsers > stats.weekUsers && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <CalendarClock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.monthUsers - stats.weekUsers} users registered earlier this month
                      </p>
                      <p className="text-xs text-gray-500">View details in user management</p>
                    </div>
                  </div>
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AdminWeatherWidget />
      </div>

      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Recent Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>View and manage recent system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Showing users registered in the last 30 days. For full user management, visit the{" "}
                  <Link href="/admin/users" className="text-green-600 hover:underline">
                    User Management
                  </Link>{" "}
                  page.
                </p>
                <UserManagement limit={5} filterByDays={30} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>View system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                View detailed analytics in the{" "}
                <Link href="/admin/analytics" className="text-green-600 hover:underline">
                  Analytics
                </Link>{" "}
                section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
