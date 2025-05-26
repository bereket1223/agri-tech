"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

import toast from 'react-hot-toast'

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }
         toast.success('Your message has been sent successfully.')
      

      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {

      toast.error('Something went wrong. Please try again.')
      
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">Contact Us</h1>
            <p className="text-lg text-gray-700">
              Have questions about our crop recommendation system? We're here to help. Reach out to our team for
              support, feedback, or partnership inquiries.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-6">Send Us a Message</h2>
              <Card>
                <CardContent className="pt-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <Textarea
                        id="message"
                        placeholder="Your message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-700 hover:bg-green-800"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <ContactInfoCard
                  icon={<MapPin className="h-6 w-6 text-green-600" />}
                  title="Our Location"
                  details={["Near to Airport, Arba Minch', Ethiopia"]}
                />
                <ContactInfoCard
                  icon={<Phone className="h-6 w-6 text-green-600" />}
                  title="Phone Numbers"
                  details={["046 881 2001"]}
                />
                <ContactInfoCard
                  icon={<Mail className="h-6 w-6 text-green-600" />}
                  title="Email Addresses"
                  details={["amu@agrismart.example.com", "li@agrismart.example.com"]}
                />
                <ContactInfoCard
                  icon={<Clock className="h-6 w-6 text-green-600" />}
                  title="Working Hours"
                  details={["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 2:00 PM", "Sunday: Closed"]}
                />
              </div>

              <div className="mt-8 rounded-xl overflow-hidden shadow-md">
              <iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4148.52467265674!2d37.57541581071911!3d6.035189028619626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17babdcdd7273905%3A0x2187284d27d50ec!2sArba%20Minch%20Agricultural%20Research%20Center!5e1!3m2!1sen!2set!4v1748068570807!5m2!1sen!2set"
               className="w-full h-64"
                allowFullScreen
                 loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                   title="Arba Minch University Location"
               ></iframe>
               </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-700 mb-12">
              Find answers to common questions about our crop recommendation system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FaqCard
                question="How accurate are the crop recommendations?"
                answer="Our system has been trained on over 2,000 data points and achieves an accuracy rate of over 90% in controlled testing environments."
              />
              <FaqCard
                question="Can I upload my own dataset for analysis?"
                answer="Yes, registered users can upload CSV files for batch processing and receive crop recommendations."
              />
              <FaqCard
                question="How do I get access to the full system?"
                answer="Create an account and wait for admin approval to gain full access."
              />
              <FaqCard
                question="Is my agricultural data kept private?"
                answer="Yes. Your data is stored securely and is only accessible to you and authorized admins."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ContactInfoCard({
  icon,
  title,
  details,
}: {
  icon: React.ReactNode
  title: string
  details: string[]
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="flex items-start space-x-4 pt-6">
        <div className="mt-1">{icon}</div>
        <div>
          <h3 className="font-semibold text-green-800 mb-2">{title}</h3>
          <div className="space-y-1">
            {details.map((detail, index) => (
              <p key={index} className="text-gray-600">
                {detail}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FaqCard({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-green-800 text-lg mb-2">{question}</h3>
        <p className="text-gray-600">{answer}</p>
      </CardContent>
    </Card>
  )
}
