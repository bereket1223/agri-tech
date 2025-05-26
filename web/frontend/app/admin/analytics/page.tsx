"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, UserPlus, TrendingUp, Activity, Calendar, PieChartIcon, BarChart3 } from "lucide-react"

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"]

export default function AnalyticsPage() {
  const [roleData, setRoleData] = useState([])
  const [signupData, setSignupData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalSignups, setTotalSignups] = useState(0)
  const [growthRate, setGrowthRate] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const roles = await axios.get("http://localhost:5000/api/analytics/user-roles")
        const signups = await axios.get("http://localhost:5000/api/analytics/monthly-signups")

        const processedRoleData = roles.data.map((item: any) => ({
          name: item._id,
          value: item.count,
          fill: COLORS[roles.data.indexOf(item) % COLORS.length],
        }))

        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        const processedSignupData = signups.data.map((item: any) => ({
          name: months[item._id],
          value: item.count,
          fill: COLORS[signups.data.indexOf(item) % COLORS.length],
        }))

        setRoleData(processedRoleData)
        setSignupData(processedSignupData)

        // Calculate totals and growth
        const totalRoles = processedRoleData.reduce((sum: number, item: any) => sum + item.value, 0)
        const totalMonthlySignups = processedSignupData.reduce((sum: number, item: any) => sum + item.value, 0)
        const lastTwoMonths = processedSignupData.slice(-2)
        const growth =
          lastTwoMonths.length === 2
            ? ((lastTwoMonths[1].value - lastTwoMonths[0].value) / lastTwoMonths[0].value) * 100
            : 0

        setTotalUsers(totalRoles)
        setTotalSignups(totalMonthlySignups)
        setGrowthRate(growth)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    signups: {
      label: "Signups",
      color: "hsl(var(--chart-2))",
    },
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto flex flex-col space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-24">
                <CardHeader className="space-y-1 p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="p-4">
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm lg:text-base text-slate-600 max-w-2xl mx-auto">
            Comprehensive insights into user engagement and platform performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white h-24">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-blue-100 text-xs">Total Users</CardDescription>
                  <CardTitle className="text-xl font-bold">{totalUsers.toLocaleString()}</CardTitle>
                </div>
                <Users className="h-6 w-6 text-blue-200" />
              </div>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-24">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-emerald-100 text-xs">Monthly Signups</CardDescription>
                  <CardTitle className="text-xl font-bold">{totalSignups.toLocaleString()}</CardTitle>
                </div>
                <UserPlus className="h-6 w-6 text-emerald-200" />
              </div>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white h-24">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="relative p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-purple-100 text-xs">Growth Rate</CardDescription>
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xl font-bold">
                      {growthRate > 0 ? "+" : ""}
                      {growthRate.toFixed(1)}%
                    </CardTitle>
                    <Badge
                      variant={growthRate >= 0 ? "default" : "destructive"}
                      className="bg-white/20 text-xs px-1 py-0"
                    >
                      <TrendingUp className="h-2 w-2 mr-1" />
                      {growthRate >= 0 ? "Up" : "Down"}
                    </Badge>
                  </div>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-200" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* User Roles Distribution */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="text-center p-4 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <PieChartIcon className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-lg font-semibold text-slate-800">User Roles Distribution</CardTitle>
              </div>
              <CardDescription className="text-sm">Breakdown of user types across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 min-h-0">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {roleData.map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Monthly Signups */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="text-center p-4 flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-lg font-semibold text-slate-800">Monthly Signups Trend</CardTitle>
              </div>
              <CardDescription className="text-sm">User registration patterns throughout the year</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 min-h-0">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={signupData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]} fill="url(#colorGradient)" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
