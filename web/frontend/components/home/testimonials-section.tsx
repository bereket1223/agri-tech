import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "This platform has revolutionized how we approach crop selection. The recommendations are spot-on and have increased our yield by 27%.",
    author: "Dr. Alemu Tadesse",
    role: "Agricultural Researcher",
    avatar: "SJ",
  },
  {
    quote:
      "The data-driven approach to crop recommendation has been invaluable for our research team. We can now make decisions with confidence.",
    author: "Prof. challa Mulu",
    role: "Agricultural Scientist",
    avatar: "CM",
  },
  {
    quote:
      "As a small-scale farmer, I was skeptical at first, but the crop recommendations have proven to be incredibly accurate for my specific soil conditions.",
    author: "farmer Tesfaye",
    role: "Small-Scale Farmer",
    avatar: "FT",

  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from researchers and farmers who have transformed their agricultural practices with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={`/placeholder.svg?height=50&width=50`} alt={testimonial.author} />
                      <AvatarFallback className="bg-green-100 text-green-800">{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

