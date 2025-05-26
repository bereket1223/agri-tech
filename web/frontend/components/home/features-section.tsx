import { Leaf, BarChart3, Cloud, Database, FileSpreadsheet, BookOpen } from "lucide-react"

const features = [
  {
    icon: <Leaf className="h-10 w-10 text-green-600" />,
    title: "Crop Recommendation",
    description:
      "Get personalized crop recommendations based on soil composition, climate conditions, and historical data.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-green-600" />,
    title: "Data Visualization",
    description:
      "Interactive charts and graphs to help you understand agricultural trends and make informed decisions.",
  },
  {
    icon: <Cloud className="h-10 w-10 text-green-600" />,
    title: "Weather Integration",
    description: "Real-time weather data and forecasts to help plan your agricultural activities effectively.",
  },
  {
    icon: <Database className="h-10 w-10 text-green-600" />,
    title: "Research Database",
    description: "Access to a comprehensive database of agricultural research and best practices.",
  },
  {
    icon: <FileSpreadsheet className="h-10 w-10 text-green-600" />,
    title: "Bulk Analysis",
    description: "Upload CSV files with multiple data points for batch processing and analysis.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-green-600" />,
    title: "Learning Resources",
    description: "Educational content and tips to improve your agricultural knowledge and practices.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our platform can help optimize your agricultural practices and increase crop yields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

