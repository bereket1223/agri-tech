"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
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

const categories = [
  "Core Agricultural Practices",
  "Community Knowledge",
  "Technology & Innovation",
  "Sustainable Practices",
  "Economic & Market Guidance",
]

type LearningTip = {
  _id: string
  title: string
  content: string
  videoUrl?: string
  image?: string | File
  pdf?: string | File
  audio?: string | File
  referenceLink?: string
  category: string
}

type AttachmentType = "pdf" | "image" | "audio"

const ITEMS_PER_PAGE = 5

export default function ManageLearningTips() {
  const [tips, setTips] = useState<LearningTip[]>([])
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [loading, setLoading] = useState(false)
  const [editingTip, setEditingTip] = useState<LearningTip | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState<AttachmentType | null>(null)

  useEffect(() => {
    fetchTips()
  }, [selectedCategory])

  const fetchTips = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/learning/learning/${selectedCategory}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setTips(data)
      setCurrentPage(1) // Reset pagination
    } catch (error) {
      console.error("Error fetching tips:", error)
      setTips([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tip?")) return
    try {
      const res = await fetch(`http://localhost:5000/api/learning/learning/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Deleted successfully")
      fetchTips()
    } catch {
      toast.error("Deletion failed")
    }
  }

  const handleEditSubmit = async () => {
    if (!editingTip) return

    try {
      const formData = new FormData()
      formData.append("title", editingTip.title)
      formData.append("content", editingTip.content)
      formData.append("category", editingTip.category)

      if (editingTip.videoUrl) formData.append("videoUrl", editingTip.videoUrl)
      if (editingTip.referenceLink) formData.append("referenceLink", editingTip.referenceLink)

      if (editingTip.pdf && typeof editingTip.pdf !== "string") {
        formData.append("pdf", editingTip.pdf)
      }
      if (editingTip.image && typeof editingTip.image !== "string") {
        formData.append("image", editingTip.image)
      }
      if (editingTip.audio && typeof editingTip.audio !== "string") {
        formData.append("audio", editingTip.audio)
      }

      const res = await fetch(`http://localhost:5000/api/learning/${editingTip._id}`, {
        method: "PUT",
        body: formData,
      })
      if (!res.ok) throw new Error("Update failed")

      toast.success("Updated successfully")
      setEditingTip(null)
      fetchTips()
    } catch (error) {
      toast.error("Update failed")
      console.error(error)
    }
  }

  const handleInputChange = (field: keyof LearningTip, value: string | File) => {
    setEditingTip((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleDeleteAttachment = async () => {
    if (!editingTip || !attachmentToDelete) return

    try {
      const formData = new FormData()
      formData.append("title", editingTip.title)
      formData.append("content", editingTip.content)
      formData.append("category", editingTip.category)
      formData.append(`delete${attachmentToDelete.charAt(0).toUpperCase() + attachmentToDelete.slice(1)}`, "true")

      if (editingTip.videoUrl) formData.append("videoUrl", editingTip.videoUrl)
      if (editingTip.referenceLink) formData.append("referenceLink", editingTip.referenceLink)

      const res = await fetch(`http://localhost:5000/api/learning/${editingTip._id}`, {
        method: "PUT",
        body: formData,
      })
      if (!res.ok) throw new Error()

      setEditingTip((prev) => {
        if (!prev) return null
        return {
          ...prev,
          [attachmentToDelete]: undefined,
        }
      })

      toast.success(`${attachmentToDelete.charAt(0).toUpperCase() + attachmentToDelete.slice(1)} deleted successfully`)
      setDeleteDialogOpen(false)
      setAttachmentToDelete(null)
    } catch (error) {
      toast.error("Failed to delete attachment")
      console.error(error)
    }
  }

  const openDeleteAttachmentDialog = (type: AttachmentType) => {
    setAttachmentToDelete(type)
    setDeleteDialogOpen(true)
  }

  const paginatedTips = tips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(tips.length / ITEMS_PER_PAGE)

  const renderAttachmentPreview = (type: AttachmentType, value?: string | File) => {
    if (!value) return null

    if (typeof value === "string") {
      const fileName = value.split("/").pop() || type
      return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border mt-1">
          <span className="text-sm truncate max-w-[200px]">{fileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openDeleteAttachmentDialog(type)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }


    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded border mt-1">
        <span className="text-sm truncate max-w-[200px]">{(value as File).name}</span>
        <span className="text-xs text-gray-500">(New file)</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Manage Learning Tips</h1>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              selectedCategory === cat ? "bg-green-600 text-white" : "bg-white text-green-700 border",
              "rounded-full px-4 py-2 text-sm",
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead className="bg-green-100 text-green-900">
            <tr>
              <th className="px-4 py-2 border">Title</th>
              <th className="px-4 py-2 border">Content</th>
              <th className="px-4 py-2 border">Attachments</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : paginatedTips.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  No tips found
                </td>
              </tr>
            ) : (
              paginatedTips.map((tip) => (
                <tr key={tip._id} className="hover:bg-gray-50 transition">
                  <td className="border px-4 py-2">{tip.title}</td>
                  <td className="border px-4 py-2">{tip.content.slice(0, 80)}...</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {tip.pdf && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">PDF</span>}
                      {tip.image && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Image</span>
                      )}
                      {tip.audio && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Audio</span>
                      )}
                      {!tip.pdf && !tip.image && !tip.audio && <span className="text-gray-500 text-xs">None</span>}
                    </div>
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingTip(tip)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(tip._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingTip} onOpenChange={(open) => !open && setEditingTip(null)}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-3xl px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Learning Tip</DialogTitle>
          </DialogHeader>

          {editingTip && (
            <form
              className="space-y-4 mt-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleEditSubmit()
              }}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input value={editingTip.title} onChange={(e) => handleInputChange("title", e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={editingTip.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">YouTube Video URL</label>
                <Input
                  value={editingTip.videoUrl || ""}
                  onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Reference Link</label>
                <Input
                  value={editingTip.referenceLink || ""}
                  onChange={(e) => handleInputChange("referenceLink", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">PDF File</label>
                  <div className="flex flex-col">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleInputChange("pdf", e.target.files?.[0] || "")}
                    />
                    {renderAttachmentPreview("pdf", editingTip.pdf)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Image</label>
                  <div className="flex flex-col">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange("image", e.target.files?.[0] || "")}
                    />
                    {renderAttachmentPreview("image", editingTip.image)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Audio</label>
                  <div className="flex flex-col">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleInputChange("audio", e.target.files?.[0] || "")}
                    />
                    {renderAttachmentPreview("audio", editingTip.audio)}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingTip(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Tip</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Attachment Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {attachmentToDelete} attachment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAttachmentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttachment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
