"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Droplets,
  Sun,
  Wind,
  Eye,
  RefreshCw,
  MapPin,
  TrendingUp,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Moon,
  CloudDrizzle,
  Gauge,
} from "lucide-react"

interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  wind: number
  pressure: number
  visibility: number
  uvIndex?: number
  icon: string
}

interface ForecastData {
  time: string
  temp: number
  icon: string
  condition: string
}

export default function AdminWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCelsius, setIsCelsius] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const getWeatherIcon = (condition: string, iconCode: string) => {
    const isNight = iconCode.includes("n")

    switch (condition.toLowerCase()) {
      case "clear":
        return isNight ? <Moon className="h-10 w-10 text-blue-200" /> : <Sun className="h-10 w-10 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-10 w-10 text-gray-400" />
      case "rain":
        return <CloudRain className="h-10 w-10 text-blue-500" />
      case "drizzle":
        return <CloudDrizzle className="h-10 w-10 text-blue-400" />
      case "thunderstorm":
        return <Zap className="h-10 w-10 text-purple-500" />
      case "snow":
        return <CloudSnow className="h-10 w-10 text-blue-100" />
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />
    }
  }

  const getWeatherBackground = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
      case "clouds":
        return "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600"
      case "rain":
      case "drizzle":
        return "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
      case "thunderstorm":
        return "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"
      case "snow":
        return "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
      default:
        return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
    }
  }

  const getWeatherRecommendation = (weather: WeatherData) => {
    if (weather.temp > 30) return { text: "Stay hydrated!", color: "bg-red-100 text-red-800" }
    if (weather.temp < 5) return { text: "Bundle up!", color: "bg-blue-100 text-blue-800" }
    if (weather.humidity > 80) return { text: "High humidity", color: "bg-cyan-100 text-cyan-800" }
    if (weather.wind > 20) return { text: "Windy conditions", color: "bg-gray-100 text-gray-800" }
    return { text: "Perfect weather!", color: "bg-green-100 text-green-800" }
  }

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : Math.round((temp * 9) / 5 + 32)
  }

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)

    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    const CITY = "Arba Minch"

    try {
      // Current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`,
      )

      // 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`,
      )

      if (!weatherRes.ok || !forecastRes.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const weatherData = await weatherRes.json()
      const forecastData = await forecastRes.json()

      setWeather({
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        wind: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        pressure: weatherData.main.pressure,
        visibility: Math.round(weatherData.visibility / 1000), // Convert to km
        icon: weatherData.weather[0].icon,
      })

      // Process forecast data (next 4 periods)
      const nextForecast = forecastData.list.slice(0, 4).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        condition: item.weather[0].main,
      }))

      setForecast(nextForecast)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to load weather data")
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWeather])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchWeather} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Weather Dashboard</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Arba Minch, Ethiopia
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCelsius(!isCelsius)}>
              °{isCelsius ? "C" : "F"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchWeather} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {weather ? (
          <>
            {/* Main Weather Display */}
            <div className={`rounded-lg p-4 text-white ${getWeatherBackground(weather.condition)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse">{getWeatherIcon(weather.condition, weather.icon)}</div>
                  <div>
                    <p className="text-3xl font-bold">
                      {convertTemp(weather.temp)}°{isCelsius ? "C" : "F"}
                    </p>
                    <p className="text-sm opacity-90 capitalize">{weather.description}</p>
                    <p className="text-xs opacity-75">
                      Feels like {convertTemp(weather.feelsLike)}°{isCelsius ? "C" : "F"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs opacity-75">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Weather Recommendation */}
              <div className="flex justify-center">
                <Badge className={getWeatherRecommendation(weather).color}>
                  {getWeatherRecommendation(weather).text}
                </Badge>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Humidity</span>
                </div>
                <p className="text-lg font-semibold text-blue-700">{weather.humidity}%</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Wind</span>
                </div>
                <p className="text-lg font-semibold text-gray-700">{weather.wind} km/h</p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-600">Pressure</span>
                </div>
                <p className="text-lg font-semibold text-purple-700">{weather.pressure} hPa</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600">Visibility</span>
                </div>
                <p className="text-lg font-semibold text-green-700">{weather.visibility} km</p>
              </div>
            </div>

            {/* Hourly Forecast */}
            {forecast.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Next Hours</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {forecast.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-600 mb-1">{item.time}</p>
                      <div className="flex justify-center mb-1">{getWeatherIcon(item.condition, item.icon)}</div>
                      <p className="text-sm font-medium">
                        {convertTemp(item.temp)}°{isCelsius ? "C" : "F"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-xs text-gray-500 text-center">
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading weather data...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
