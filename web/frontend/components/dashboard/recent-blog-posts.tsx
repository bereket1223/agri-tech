import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "Maximizing Rice Yields: Best Practices for Sustainable Farming",
    excerpt:
      "Learn how to optimize your rice cultivation with these expert tips on water management, soil preparation, and pest control.",
    author: "Dr. Sarah Johnson",
    date: "June 15, 2023",
    image: "/placeholder.svg?height=200&width=300",
    category: "Rice Cultivation",
  },
  {
    id: 2,
    title: "Climate-Resilient Agriculture: Adapting to Changing Weather Patterns",
    excerpt:
      "Discover strategies to make your farm more resilient to climate change, including crop diversification and water conservation techniques.",
    author: "Prof. Michael Chen",
    date: "May 28, 2023",
    image: "/placeholder.svg?height=200&width=300",
    category: "Climate Adaptation",
  },
  {
    id: 3,
    title: "Soil Health Management: The Foundation of Successful Farming",
    excerpt:
      "Explore the importance of soil health and learn practical methods to improve soil structure, fertility, and biological activity.",
    author: "James Wilson",
    date: "May 10, 2023",
    image: "/placeholder.svg?height=200&width=300",
    category: "Soil Management",
  },
]

export default function RecentBlogPosts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-40 object-cover" />
          <CardContent className="p-5">
            <div className="mb-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {post.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.excerpt}</p>
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span>{post.author}</span>
                <span className="mx-1">•</span>
                <span>{post.date}</span>
              </div>
              <Link
                href={`/dashboard/blog/${post.id}`}
                className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center"
              >
                Read <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

