'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Loader2, Trash2 } from 'lucide-react'

interface ContactMessage {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async (page = 1) => {
    try {
      setIsLoading(true)
      const res = await axios.get('http://localhost:5000/api/contact?page=${page}&limit=5')
      setMessages(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      await axios.delete(`http://localhost:5000/api/contact/${id}`);

      setMessages((prev) => prev.filter((msg) => msg._id !== id))
    } catch (err) {
      alert('Failed to delete message')
    }
  }

  useEffect(() => {
    fetchMessages(currentPage)
  }, [currentPage])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-green-800 mb-4">Messages</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-6 w-6 text-green-600" />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg._id} className="flex justify-between items-start gap-4 p-4 border-green-100">
              <div className="flex-1">
                <p className="font-semibold text-green-900">{msg.name}</p>
                <p className="text-gray-600 text-sm">{msg.email}</p>
                <p className="text-green-700 font-medium mt-2">{msg.subject}</p>
                <p className="text-gray-800 mt-1 truncate max-w-md">{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Full Message</DialogTitle>
                    </DialogHeader>
                    <div>
                      <p><strong>Name:</strong> {msg.name}</p>
                      <p><strong>Email:</strong> {msg.email}</p>
                      <p><strong>Subject:</strong> {msg.subject}</p>
                      <p className="mt-4 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteMessage(msg._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm px-3">
                Page {currentPage} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default AdminMessagesPage
