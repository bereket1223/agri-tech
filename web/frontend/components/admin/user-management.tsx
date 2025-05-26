"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  FileText,
  Download,
  Users,
  GraduationCap,
  Tractor,
  BookOpen,
  User,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface UserType {
  _id: string
  firstName: string
  lastName: string
  email: string
  organization?: string
  position?: string
  isAdmin: boolean
  createdAt: string
}

interface UserManagementProps {
  limit?: number
  filterByDays?: number
}

interface PositionCounts {
  researcher: number
  farmer: number
  student: number
  educator: number
  other: number
  total: number
}

export default function UserManagement({ limit, filterByDays }: UserManagementProps) {
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [displayedUsers, setDisplayedUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [activePosition, setActivePosition] = useState<string>("all")
  const [positionCounts, setPositionCounts] = useState<PositionCounts>({
    researcher: 0,
    farmer: 0,
    student: 0,
    educator: 0,
    other: 0,
    total: 0,
  })
  const [reportOptions, setReportOptions] = useState({
    includePersonalInfo: true,
    includeOrganization: true,
    includePosition: true,
    includeJoinDate: true,
    includeRole: true,
    filterByPosition: "all",
    format: "csv",
  })
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    position: "",
    isAdmin: false,
  })
  const [addUserFormData, setAddUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    position: "",
    isAdmin: false,
    password: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { toast } = useToast()
  const csvLinkRef = useRef<HTMLAnchorElement>(null)

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)

      // Calculate position counts
      const counts = {
        researcher: 0,
        farmer: 0,
        student: 0,
        educator: 0,
        other: 0,
        total: data.length,
      }

      data.forEach((user: UserType) => {
        const position = user.position || "other"
        if (position in counts) {
          counts[position as keyof typeof counts]++
        } else {
          counts.other++
        }
      })

      setPositionCounts(counts as PositionCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching users")
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users based on props, active position, and search query
  useEffect(() => {
    let filtered = [...users]

    // Filter by days if specified
    if (filterByDays) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - filterByDays)

      filtered = filtered.filter((user) => new Date(user.createdAt) >= cutoffDate)
    }

    // Filter by position if not "all"
    if (activePosition !== "all") {
      filtered = filtered.filter((user) => {
        // Handle users with no position set
        const userPosition = user.position || "other"
        return userPosition === activePosition
      })
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.organization && user.organization.toLowerCase().includes(query)) ||
          (user.position && user.position.toLowerCase().includes(query)),
      )
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [users, limit, filterByDays, activePosition, searchQuery])

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex))
  }, [filteredUsers, currentPage, itemsPerPage])

  // Handle edit user
  const handleEditClick = (user: UserType) => {
    setSelectedUser(user)
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      organization: user.organization || "",
      position: user.position || "",
      isAdmin: user.isAdmin,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete user
  const handleDeleteClick = (user: UserType) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Handle form input changes for edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form input changes for add user form
  const handleAddUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle select changes for edit form
  const handleSelectChange = (name: string, value: string) => {
    if (name === "isAdmin") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Handle select changes for add user form
  const handleAddUserSelectChange = (name: string, value: string) => {
    if (name === "isAdmin") {
      setAddUserFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }))
    } else {
      setAddUserFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) return

    try {
      const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      // Refresh user list
      await fetchUsers()

      toast({
        title: "User updated",
        description: `${editFormData.firstName} ${editFormData.lastName} has been updated successfully.`,
      })

      setIsEditDialogOpen(false)
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Failed to update user",
        variant: "destructive",
      })
    }
  }

  // Submit add user form
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addUserFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to add user")
      }

      // Refresh user list
      await fetchUsers()

      toast({
        title: "User added",
        description: `${addUserFormData.firstName} ${addUserFormData.lastName} has been added successfully.`,
      })

      // Reset form
      setAddUserFormData({
        firstName: "",
        lastName: "",
        email: "",
        organization: "",
        position: "",
        isAdmin: false,
        password: "",
      })

      setIsAddUserDialogOpen(false)
    } catch (err) {
      toast({
        title: "Add user failed",
        description: err instanceof Error ? err.message : "Failed to add user",
        variant: "destructive",
      })
    }
  }

  // Delete user
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem("userToken") || sessionStorage.getItem("userToken")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Remove user from state
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== selectedUser._id))

      toast({
        title: "User deleted",
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been deleted successfully.`,
      })

      setIsDeleteDialogOpen(false)
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Generate report
  const generateReport = () => {
    // Filter users based on report options
    let reportUsers = [...users]

    if (reportOptions.filterByPosition !== "all") {
      reportUsers = reportUsers.filter((user) => {
        const userPosition = user.position || "other"
        return userPosition === reportOptions.filterByPosition
      })
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers
    const headers = []
    if (reportOptions.includePersonalInfo) headers.push("First Name", "Last Name", "Email")
    if (reportOptions.includeOrganization) headers.push("Organization")
    if (reportOptions.includePosition) headers.push("Position")
    if (reportOptions.includeRole) headers.push("Role")
    if (reportOptions.includeJoinDate) headers.push("Join Date")

    csvContent += headers.join(",") + "\n"

    // Add user data
    reportUsers.forEach((user) => {
      const row = []
      if (reportOptions.includePersonalInfo) row.push(`"${user.firstName}"`, `"${user.lastName}"`, `"${user.email}"`)
      if (reportOptions.includeOrganization) row.push(`"${user.organization || ""}"`)
      if (reportOptions.includePosition) row.push(`"${user.position || "other"}"`)
      if (reportOptions.includeRole) row.push(`"${user.isAdmin ? "Admin" : "User"}"`)
      if (reportOptions.includeJoinDate) row.push(`"${formatDate(user.createdAt)}"`)

      csvContent += row.join(",") + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    if (csvLinkRef.current) {
      csvLinkRef.current.setAttribute("href", encodedUri)
      csvLinkRef.current.setAttribute(
        "download",
        `user-report-${reportOptions.filterByPosition}-${new Date().toISOString().split("T")[0]}.csv`,
      )
      csvLinkRef.current.click()
    }

    toast({
      title: "Report generated",
      description: `Report for ${reportOptions.filterByPosition === "all" ? "all users" : reportOptions.filterByPosition + " users"} has been downloaded.`,
    })

    setIsReportDialogOpen(false)
  }

  // Handle report option changes
  const handleReportOptionChange = (option: string, value: any) => {
    setReportOptions((prev) => ({
      ...prev,
      [option]: value,
    }))
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Get position icon
  const getPositionIcon = (position: string) => {
    switch (position) {
      case "researcher":
        return <Users className="h-4 w-4" />
      case "farmer":
        return <Tractor className="h-4 w-4" />
      case "student":
        return <GraduationCap className="h-4 w-4" />
      case "educator":
        return <BookOpen className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Get position color
  const getPositionColor = (position: string) => {
    switch (position) {
      case "researcher":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "farmer":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "student":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "educator":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg text-gray-700">Loading users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading users</p>
        <p className="text-sm">{error}</p>
        <Button onClick={fetchUsers} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      {!limit && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddUserDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card
              className={`cursor-pointer ${
                activePosition === "all" ? "border-2 border-green-500 bg-green-50" : "bg-white"
              }`}
              onClick={() => setActivePosition("all")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">All Users</p>
                  <p className="text-2xl font-bold">{positionCounts.total}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer ${
                activePosition === "researcher" ? "border-2 border-blue-500 bg-blue-50" : "bg-white"
              }`}
              onClick={() => setActivePosition("researcher")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Researchers</p>
                  <p className="text-2xl font-bold">{positionCounts.researcher}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer ${
                activePosition === "farmer" ? "border-2 border-green-500 bg-green-50" : "bg-white"
              }`}
              onClick={() => setActivePosition("farmer")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Farmers</p>
                  <p className="text-2xl font-bold">{positionCounts.farmer}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Tractor className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer ${
                activePosition === "student" ? "border-2 border-purple-500 bg-purple-50" : "bg-white"
              }`}
              onClick={() => setActivePosition("student")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Students</p>
                  <p className="text-2xl font-bold">{positionCounts.student}</p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer ${
                activePosition === "educator" ? "border-2 border-amber-500 bg-amber-50" : "bg-white"
              }`}
              onClick={() => setActivePosition("educator")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Educators</p>
                  <p className="text-2xl font-bold">{positionCounts.educator}</p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Search and Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search users..." className="pl-8" value={searchQuery} onChange={handleSearchChange} />
        </div>

        <div className="flex items-center space-x-2">
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No users found in this category</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.position ? (
                        <Badge className={getPositionColor(user.position)}>
                          <span className="flex items-center">
                            {getPositionIcon(user.position)}
                            <span className="ml-1 capitalize">{user.position}</span>
                          </span>
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          <span className="flex items-center">
                            <User className="h-4 w-4" />
                            <span className="ml-1">Other</span>
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.organization || "—"}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit User</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setReportOptions((prev) => ({
                                  ...prev,
                                  filterByPosition: user.position || "other",
                                }))
                                setIsReportDialogOpen(true)
                              }}
                            >
                              Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user)}>
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  value={editFormData.organization}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={editFormData.position} onValueChange={(value) => handleSelectChange("position", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researcher">Agricultural Researcher</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="educator">Educator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isAdmin">Role</Label>
                <Select
                  value={editFormData.isAdmin ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange("isAdmin", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">User</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. All fields marked with * are required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUserSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addFirstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="addFirstName"
                    name="firstName"
                    value={addUserFormData.firstName}
                    onChange={handleAddUserInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addLastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="addLastName"
                    name="lastName"
                    value={addUserFormData.lastName}
                    onChange={handleAddUserInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addEmail"
                  name="email"
                  type="email"
                  value={addUserFormData.email}
                  onChange={handleAddUserInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addPassword">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addPassword"
                  name="password"
                  type="password"
                  value={addUserFormData.password}
                  onChange={handleAddUserInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addOrganization">Organization</Label>
                <Input
                  id="addOrganization"
                  name="organization"
                  value={addUserFormData.organization}
                  onChange={handleAddUserInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addPosition">Position</Label>
                <Select
                  value={addUserFormData.position}
                  onValueChange={(value) => handleAddUserSelectChange("position", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researcher">Agricultural Researcher</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="educator">Educator</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addIsAdmin">Role</Label>
                <Select
                  value={addUserFormData.isAdmin ? "true" : "false"}
                  onValueChange={(value) => handleAddUserSelectChange("isAdmin", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">User</SelectItem>
                    <SelectItem value="true">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Generation Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate User Report</DialogTitle>
            <DialogDescription>Select the information to include in your report.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Filter by Position</Label>
              <Select
                value={reportOptions.filterByPosition}
                onValueChange={(value) => handleReportOptionChange("filterByPosition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="researcher">Researchers</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="educator">Educators</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Include Information</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePersonalInfo"
                    checked={reportOptions.includePersonalInfo}
                    onCheckedChange={(checked) => handleReportOptionChange("includePersonalInfo", checked === true)}
                  />
                  <label
                    htmlFor="includePersonalInfo"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Personal Information (Name, Email)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeOrganization"
                    checked={reportOptions.includeOrganization}
                    onCheckedChange={(checked) => handleReportOptionChange("includeOrganization", checked === true)}
                  />
                  <label
                    htmlFor="includeOrganization"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Organization
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePosition"
                    checked={reportOptions.includePosition}
                    onCheckedChange={(checked) => handleReportOptionChange("includePosition", checked === true)}
                  />
                  <label
                    htmlFor="includePosition"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Position
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRole"
                    checked={reportOptions.includeRole}
                    onCheckedChange={(checked) => handleReportOptionChange("includeRole", checked === true)}
                  />
                  <label
                    htmlFor="includeRole"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Role (Admin/User)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeJoinDate"
                    checked={reportOptions.includeJoinDate}
                    onCheckedChange={(checked) => handleReportOptionChange("includeJoinDate", checked === true)}
                  />
                  <label
                    htmlFor="includeJoinDate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Join Date
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <Select value={reportOptions.format} onValueChange={(value) => handleReportOptionChange("format", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={generateReport}>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden download link for CSV export */}
      <a ref={csvLinkRef} style={{ display: "none" }} />
    </div>
  )
}
