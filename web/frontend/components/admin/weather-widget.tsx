"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Sun, Wind } from "lucide-react"

export default function AdminWeatherWidget() {
  const [weather, setWeather] = useState<null | {
    temp: number
    condition: string
    humidity: number
    wind: number
  }>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      const CITY = "Arba Minch"

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
        )
        const data = await res.json()

        if (!res.ok) {
          console.error("Weather API error:", { status: res.status, data })
          return
        }

        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          wind: data.wind.speed,
        })
      } catch (err) {
        console.error("Fetch error:", err)
      }
    }

    fetchWeather()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Weather</CardTitle>
        <CardDescription>Current conditions in your area</CardDescription>
      </CardHeader>
      <CardContent>
        {weather ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sun className="h-10 w-10 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm text-gray-500">{weather.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Arbaminch</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleString("en-US", {
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-full mr-2">
                  <Wind className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wind</p>
                  <p className="text-sm font-medium">{weather.wind} km/h</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading weather...</p>
        )}
      </CardContent>
    </Card>
  )
}
