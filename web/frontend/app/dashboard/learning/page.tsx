"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Leaf,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Search,
  Play,
  FileText,
  Volume2,
  ExternalLink,
  BookOpen,
  Users,
  Cpu,
  Recycle,
  TrendingUp,
  Filter,
} from "lucide-react"
import clsx from "clsx"

function getEmbedUrl(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

const categories = [
  { name: "Core Agricultural Practices", icon: Leaf, color: "bg-green-500" },
  { name: "Community Knowledge", icon: Users, color: "bg-blue-500" },
  { name: "Technology & Innovation", icon: Cpu, color: "bg-purple-500" },
  { name: "Sustainable Practices", icon: Recycle, color: "bg-emerald-500" },
  { name: "Economic & Market Guidance", icon: TrendingUp, color: "bg-orange-500" },
]

type LearningTip = {
  _id: string
  title: string
  content: string
  videoUrl?: string
  image?: string
  pdf?: string
  audio?: string
  referenceLink?: string
  category: string
}

const ITEMS_PER_PAGE = 6

export default function LearningTipsPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name)
  const [tips, setTips] = useState<LearningTip[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/learning/learning/${selectedCategory}`)
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        const data = await res.json()
        setTips(data)
        setCurrentPage(1)
        setSearchQuery("")
      } catch (err) {
        console.error("Error fetching tips:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [selectedCategory])

  const filteredTips = tips.filter(
    (tip) =>
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const paginatedTips = filteredTips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredTips.length / ITEMS_PER_PAGE)

  const selectedCategoryData = categories.find((cat) => cat.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Agricultural Learning Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover expert knowledge, innovative techniques, and sustainable practices to enhance your agricultural
            journey
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Category</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.name
              return (
                <Button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={clsx(
                    "group relative overflow-hidden rounded-full transition-all duration-300 px-6 py-3 text-sm font-medium",
                    "hover:scale-105 hover:shadow-lg",
                    isSelected
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={clsx(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isSelected ? "text-white" : "text-gray-500",
                      )}
                    />
                    <span className="relative z-10">{cat.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-20 animate-pulse" />
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div
            className={clsx("relative w-full max-w-md transition-all duration-300", isSearchFocused ? "scale-105" : "")}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tips and knowledge..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-full shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300"
            />
            {searchQuery && (
              <Badge variant="secondary" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {filteredTips.length} results
              </Badge>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="animate-spin w-12 h-12 text-green-500" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-green-200 rounded-full animate-ping" />
            </div>
            <p className="mt-4 text-gray-600 animate-pulse">Loading agricultural wisdom...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            {paginatedTips.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedCategoryData && (
                    <div className={clsx("p-2 rounded-lg", selectedCategoryData.color)}>
                      <selectedCategoryData.icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{selectedCategory}</h2>
                    <p className="text-sm text-gray-500">
                      {filteredTips.length} tip{filteredTips.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Grid */}
            <div className="space-y-8">
              {paginatedTips.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">No tips found</h3>
                    <p className="text-gray-500">Try adjusting your search or selecting a different category</p>
                  </CardContent>
                </Card>
              ) : (
                paginatedTips.map((tip, index) => (
                  <Card
                    key={tip._id}
                    className={clsx(
                      "group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500",
                      "bg-white/80 backdrop-blur-sm hover:bg-white",
                      "transform hover:-translate-y-2",
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Media Section */}
                        {(tip.videoUrl && getEmbedUrl(tip.videoUrl)) || tip.image ? (
                          <div className="lg:w-2/5 w-full h-64 lg:h-80 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                            {tip.videoUrl && getEmbedUrl(tip.videoUrl) ? (
                              <div className="relative w-full h-full">
                                <iframe
                                  className="w-full h-full object-cover"
                                  src={getEmbedUrl(tip.videoUrl)!}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                                <div className="absolute top-4 left-4 z-20">
                                  <Badge className="bg-red-500 text-white">
                                    <Play className="w-3 h-3 mr-1" />
                                    Video
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-full h-full">
                                <img
                                  src={`http://localhost:5000${tip.image}`}
                                  alt={tip.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="lg:w-2/5 w-full h-64 lg:h-80 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                            <div className="text-center">
                              <BookOpen className="w-16 h-16 text-green-400 mx-auto mb-2" />
                              <p className="text-green-600 font-medium">Knowledge Article</p>
                            </div>
                          </div>
                        )}

                        {/* Content Section */}
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-2xl font-bold text-gray-800 leading-tight group-hover:text-green-600 transition-colors">
                                {tip.title}
                              </h3>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {tip.category}
                              </Badge>
                            </div>

                            <p className="text-gray-600 leading-relaxed line-clamp-4">{tip.content}</p>
                          </div>

                          {/* Media Links */}
                          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                            {tip.pdf && (
                              <a
                                href={tip.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors text-sm font-medium"
                              >
                                <FileText className="w-4 h-4" />
                                PDF Guide
                              </a>
                            )}
                            {tip.audio && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
                                <Volume2 className="w-4 h-4" />
                                Audio Available
                              </div>
                            )}
                            {tip.referenceLink && (
                              <a
                                href={tip.referenceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Reference
                              </a>
                            )}
                          </div>

                          {/* Audio Player */}
                          {tip.audio && (
                            <div className="mt-4">
                              <audio controls className="w-full h-10 rounded-lg">
                                <source src={tip.audio} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-full hover:bg-green-50 hover:border-green-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  className={clsx(
                    "w-10 h-10 rounded-full transition-all duration-200",
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-110"
                      : "hover:bg-green-50 hover:border-green-300",
                  )}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-full hover:bg-green-50 hover:border-green-300"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
