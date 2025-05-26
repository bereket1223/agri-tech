"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import axios from "axios"

import { Send } from "lucide-react"
import { MemoizedMarkdown } from "@/components/memoized-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Chat(formData:any) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { role: "user", text: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post(
        `http://localhost:5000/api/chat/ai`,
        { message: input, agroData: { ...formData } },
        {
          headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        }
      )
      setMessages((prev) => [...prev, { role: "assistant", text: response.data.reply }])
    } catch (error) {
      console.error("Error fetching response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div className="flex-1">  
          <h1 className="text-xl font-medium text-gray-800">Agri Assistant</h1>
          <p className="text-sm text-gray-500">AI-powered agricultural chat</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.role === "user" ? (
                <div>{message.text}</div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <MemoizedMarkdown id={`msg-${index}`} content={message.text} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the Agri assistant..."
            className="flex-1 bg-gray-100 border-gray-300"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Farmer, ask any agricultural question and I'll provide information based on your context.
        </p>
      </div>
    </div>
  )
}
