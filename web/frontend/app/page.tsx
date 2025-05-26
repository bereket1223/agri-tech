import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf } from "lucide-react"
import HeroSection from "@/components/home/hero-section"
import FeaturesSection from "@/components/home/features-section"
import TestimonialsSection from "@/components/home/testimonials-section"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
    < Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />

        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to optimize your crop selection?</h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join our platform today and get access to cutting-edge crop recommendation technology backed by data
              science.
            </p>
            <Link href="/auth/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-lg">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
     <Footer />
    </div>
  )
}

