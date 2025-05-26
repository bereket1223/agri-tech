import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-green-50 to-white py-20 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/imge.jpg?height=800&width=1600')] bg-no-repeat bg-cover bg-center" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Smart Crop Recommendations for Better Yields
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-lg">
              Our AI-powered platform analyzes soil conditions, climate data, and agricultural research to recommend the
              optimal crops for your specific conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-lg rounded-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-12">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="/imge.jpg?height=600&width=800"
                alt="Crop analysis visualization"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

