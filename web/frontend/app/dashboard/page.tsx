"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, ArrowRight, Target, MapPin, Lightbulb, Flag } from "lucide-react"
import WeatherWidget from "@/components/dashboard/weather-widget"
import CropRecommendationGuide from "@/components/dashboard/crop-recommendation-guide"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// User data interface
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

export default function DashboardPage() {
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
            setUserData(parsedData)
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        } else {
          // No user data found, redirect to login
          toast({
            title: "Authentication required",
            description: "Please log in to access the dashboard.",
            variant: "destructive",
          })
          router.push("/auth/signin")
        }
      }
    }

    getUserData()
  }, [router, toast])

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
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
  
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              Welcome back, {userData ? userData.firstName : "Guest"}
            </h1>
            <p className="text-gray-600 mt-1">Arba Minch Agricultural Research Center Dashboard</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={handleLogout}>
              Logout
            </Button>
            <Link href="/dashboard/crop-recommendation">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 shadow-md">
                Get Crop Recommendation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Research Center Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Lightbulb className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vision</p>
                <h3 className="text-sm font-medium">Leading agricultural innovation</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <Flag className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mission</p>
                <h3 className="text-sm font-medium">Sustainable farming solutions</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Goal</p>
                <h3 className="text-sm font-medium">Improve crop productivity</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <h3 className="text-sm font-medium">Arba Minch, Ethiopia</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
              <CardTitle className="text-green-800">Weather Forecast</CardTitle>
              <CardDescription>Local conditions for your farm</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <WeatherWidget />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-blue-800">Crop Recommendations</CardTitle>
              <CardDescription>Based on current soil and weather conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CropRecommendationGuide />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
            <CardTitle className="flex items-center text-green-800">
              <BarChart className="mr-2 h-5 w-5 text-green-600" />
              Agricultural Information
            </CardTitle>
            <CardDescription>Crop recommendations, irrigation techniques and more</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-green-100">
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg text-green-800">Crop Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">
                    In the Arba Minch region, teff, maize, and sorghum thrive in the highland areas, while banana,
                    mango, and avocado are suitable for lower elevations. Coffee grows well at mid-altitudes with
                    partial shade. Crop rotation with legumes like chickpea and haricot bean helps maintain soil
                    fertility. Consider rainfall patterns when planning planting schedules.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-blue-100">
                <CardHeader className="bg-blue-50 pb-2">
                  <CardTitle className="text-lg text-blue-800">Irrigation Techniques</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">
                    Drip irrigation is ideal for row crops and fruit trees in the region, reducing water usage by up to
                    60%. Furrow irrigation works well for maize and teff fields on gentle slopes. Small-scale farmers
                    benefit from affordable water harvesting techniques like contour bunds and check dams. During dry
                    seasons, early morning or evening irrigation minimizes evaporation losses.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-amber-100">
                <CardHeader className="bg-amber-50 pb-2">
                  <CardTitle className="text-lg text-amber-800">Sustainable Farming</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600">
                    Intercropping maize with haricot beans increases overall yield and improves soil health. Composting
                    crop residues and animal manure provides essential nutrients while reducing fertilizer costs.
                    Agroforestry practices combining fruit trees with annual crops offer multiple income sources and
                    environmental benefits. Contour farming on slopes prevents erosion during heavy rains common in the
                    region.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
