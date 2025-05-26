import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Leaf, BarChart3, Database, Cloud, Users } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">Our Agricultural Services</h1>
              <p className="text-lg text-gray-700 mb-8">
                Discover how our AI-powered platform can transform your agricultural practices with data-driven insights
                and recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* Main Services */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceCard
                icon={<Leaf className="h-12 w-12 text-green-600" />}
                title="Crop Recommendation"
                description="Get personalized crop recommendations based on soil composition, climate conditions, and historical data."
                features={[
                  "Single input recommendations",
                  "Batch processing via CSV upload",
                  "Historical recommendation tracking",
                  "Seasonal crop suggestions",
                ]}
              />

              <ServiceCard
                icon={<BarChart3 className="h-12 w-12 text-green-600" />}
                title="Data Analytics"
                description="Analyze agricultural data to identify patterns and optimize farming practices."
                features={[
                  "Yield prediction models",
                  "Performance comparison",
                  "Trend analysis",
                  "Visual data representation",
                ]}
              />

              <ServiceCard
                icon={<Database className="h-12 w-12 text-green-600" />}
                title="Research Tools"
                description="Access powerful tools designed specifically for agricultural researchers."
                features={[
                  "Bulk data processing",
                  "Research collaboration",
                  "Dataset management",
                  "Experiment tracking",
                ]}
              />

              <ServiceCard
                icon={<Cloud className="h-12 w-12 text-green-600" />}
                title="Weather Integration"
                description="Access real-time and historical weather data to inform your agricultural decisions."
                features={[
                  "Local weather forecasts",
                  "Climate trend analysis",
                  "Seasonal predictions",
                  "Weather alerts",
                ]}
              />

              <ServiceCard
                icon={<Users className="h-12 w-12 text-green-600" />}
                title="Community & Learning"
                description="Connect with other agricultural professionals and access educational resources."
                features={[
                  "Expert-created learning materials",
                  "Best practice guides",
                  "Seasonal farming tips",
                  "Research publications",
                ]}
              />

              <div className="bg-green-50 rounded-xl p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-green-800 mb-4">Ready to get started?</h3>
                <p className="text-gray-700 mb-6">
                  Sign up today to access our full suite of agricultural services and start optimizing your crop
                  selection.
                </p>
                <Button asChild size="lg" className="bg-green-700 hover:bg-green-800">
                  <Link href="/auth/signup">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-green-800 mb-4">How Our Crop Recommendation Works</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Our platform uses advanced machine learning algorithms trained on extensive agricultural data to provide
                accurate recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ProcessCard
                number="01"
                title="Input Your Data"
                description="Enter soil parameters (N, P, K, pH), climate conditions (temperature, humidity, rainfall), and location details."
              />

              <ProcessCard
                number="02"
                title="AI Analysis"
                description="Our machine learning model analyzes your inputs against our database of 2000+ crop scenarios and conditions."
              />

              <ProcessCard
                number="03"
                title="Get Recommendations"
                description="Receive personalized crop recommendations with confidence scores and supporting information."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ServiceCard({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-2xl text-green-800">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ProcessCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <div className="text-4xl font-bold text-green-600 mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-green-800 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
