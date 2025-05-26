"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  MapPin,
  FileText,
} from "lucide-react"
import { Loader2 } from "lucide-react"
import { subDays, subWeeks, subMonths } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type PendingUser = {
  _id: string
  firstName: string
  lastName: string
  email: string
  organization: string
  position: string
  date: string
  phone?: string
  address?: string
  bio?: string
}

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "all">("all")
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()
  const usersPerPage = 5

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/pending-users")
        const data = await res.json()
        console.log("API response data structure:", data)
        setPendingUsers(data)
        applyTimeFilter(data, timeFilter)
      } catch (err) {
        console.error("Error fetching pending users:", err)
        toast({
          title: "Error",
          description: "Failed to load pending users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPendingUsers()
  }, [toast, timeFilter])

  // Apply time filter to users
  const applyTimeFilter = (users: PendingUser[], filter: string) => {
    const now = new Date()
    let filtered = [...users]

    if (filter === "day") {
      const dayAgo = subDays(now, 1)
      filtered = users.filter((user) => new Date(user.date) >= dayAgo)
    } else if (filter === "week") {
      const weekAgo = subWeeks(now, 1)
      filtered = users.filter((user) => new Date(user.date) >= weekAgo)
    } else if (filter === "month") {
      const monthAgo = subMonths(now, 1)
      filtered = users.filter((user) => new Date(user.date) >= monthAgo)
    }

    setFilteredUsers(filtered)
    // Reset to first page when filter changes
    setCurrentPage(1)
  }

  // Handle time filter change
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value as "day" | "week" | "month" | "all")
    applyTimeFilter(pendingUsers, value)
  }

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      })

      if (res.ok) {
        // Remove the approved user from both lists
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId))
        setFilteredUsers((prev) => prev.filter((user) => user._id !== userId))

        toast({
          title: "User Approved",
          description: "The user has been successfully approved.",
          variant: "default",
        })
      } else {
        const errorData = await res.json()
        console.error("Failed to approve user:", errorData)
        toast({
          title: "Approval Failed",
          description: "There was an error approving the user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Approve error:", err)
      toast({
        title: "Approval Failed",
        description: "There was an error approving the user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      })

      if (res.ok) {
        // Remove the rejected user from both lists
        setPendingUsers((prev) => prev.filter((user) => user._id !== userId))
        setFilteredUsers((prev) => prev.filter((user) => user._id !== userId))

        toast({
          title: "User Rejected",
          description: "The user has been successfully rejected.",
          variant: "default",
        })
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }))
        console.error("Failed to reject user:", errorData)
        toast({
          title: "Rejection Failed",
          description: `There was an error rejecting the user: ${errorData.message || "Unknown error"}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Reject error:", err)
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle view details
  const handleViewDetails = (user: PendingUser) => {
    console.log("Selected user details:", user)
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  return (
    <div className="space-y-6">
      {/* Time filter tabs */}
      <div className="flex justify-end mb-4">
        <Tabs defaultValue="all" onValueChange={handleTimeFilterChange}>
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : currentUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="flex justify-center mb-2">
            <Calendar className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-lg font-medium">No pending users</p>
          <p className="text-sm">There are no users waiting for approval in this time period.</p>
        </div>
      ) : (
        <>
          {currentUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm mt-1">
                      <span className="text-gray-700">{user.organization}</span>
                      <span className="text-gray-700">{user.position}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {user.date ? new Date(user.date).toLocaleString() : "Unknown"}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleReject(user._id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(user._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the user registration</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {selectedUser.firstName || "N/A"} {selectedUser.lastName || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{selectedUser.email || "N/A"}</p>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="font-medium">{selectedUser.organization || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b pb-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium capitalize">{selectedUser.position || "Not specified"}</p>
                </div>
              </div>

              {selectedUser.address && (
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedUser.address}</p>
                  </div>
                </div>
              )}

              {selectedUser.bio && (
                <div className="flex items-start gap-3 border-b pb-3">
                  <div className="bg-pink-100 p-2 rounded-full mt-1">
                    <FileText className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium">{selectedUser.bio}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium">
                    {selectedUser.date ? new Date(selectedUser.date).toLocaleString() : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (selectedUser) {
                    handleReject(selectedUser._id)
                    setIsDetailsOpen(false)
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  if (selectedUser) {
                    handleApprove(selectedUser._id)
                    setIsDetailsOpen(false)
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
