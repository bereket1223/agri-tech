"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadIcon as FileUpload, ImageIcon, Link2, FileText, Youtube } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const categories = [
  "Core Agricultural Practices",
  "Community Knowledge",
  "Technology & Innovation",
  "Sustainable Practices",
  "Economic & Market Guidance",
]

function getEmbedUrl(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

export default function NewLearningTipPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [referenceLink, setReferenceLink] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [activeTab, setActiveTab] = useState("content")
  const [isPreview, setIsPreview] = useState(false)

  const router = useRouter()

  const uploadFile = async (file: File, type: "image" | "pdf") => {
    const formData = new FormData()
    formData.append(type, file)
    const res = await axios.post(`http://localhost:5000/api/upload/${type}`, formData)
    return res.data.url
  }

  const handleSubmit = async () => {
    try {
      let uploadedImageUrl = ""
      let uploadedPdfUrl = ""

      if (image) uploadedImageUrl = await uploadFile(image, "image")
      if (pdf) uploadedPdfUrl = await uploadFile(pdf, "pdf")

      const res = await axios.post("http://localhost:5000/api/learning/learning", {
        title,
        content,
        image: uploadedImageUrl,
        pdf: uploadedPdfUrl,
        videoUrl,
        referenceLink,
        category,
      })

      if (res.status === 201) {
        toast.success("Learning Tip submitted successfully!")

        // Reset the form
        setTitle("")
        setContent("")
        setImage(null)
        setPdf(null)
        setVideoUrl("")
        setReferenceLink("")
        setCategory(categories[0])
        setIsPreview(false)
      }
    } catch (error) {
      toast.error("Submission failed. Please try again.")
      console.error(error)
    }
  }

  const getAttachmentCount = () => {
    let count = 0
    if (image) count++
    if (pdf) count++
    if (videoUrl) count++
    if (referenceLink) count++
    return count
  }

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                {category}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button onClick={() => setIsPreview(false)} variant="outline">
                Edit
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                Publish Tip
              </Button>
            </div>
          </div>

          <Separator className="my-6" />


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>

              {referenceLink && (
                <div className="mt-6 flex items-center">
                  <Link2 className="h-4 w-4 mr-2 text-blue-600" />
                  <a
                    href={referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {referenceLink}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {image && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" /> Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt="Selected image"
                      className="w-full rounded-md object-cover aspect-video"
                    />
                  </CardContent>
                </Card>
              )}

              {pdf && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" /> PDF Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <iframe src={URL.createObjectURL(pdf)} className="w-full h-64 border rounded" title="PDF Preview" />
                  </CardContent>
                </Card>
              )}

              {videoUrl && getEmbedUrl(videoUrl) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Youtube className="h-4 w-4 mr-2" /> Video Tutorial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <iframe
                      className="w-full aspect-video rounded-md"
                      src={getEmbedUrl(videoUrl)!}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube Video"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-green-800">Add New Learning Tip</CardTitle>
              <CardDescription className="text-green-700 mt-1">
                Share valuable agricultural knowledge with the community
              </CardDescription>
            </div>
            <Link href="/admin/learning/manage">
              <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                Manage Tips
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="media">
                Media & Attachments {getAttachmentCount() > 0 && `(${getAttachmentCount()})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your learning tip"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">
                  Description
                </Label>
                <Textarea
                  id="content"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide detailed information about this learning tip..."
                  className="resize-y"
                />
              </div>
            </TabsContent>


            <TabsContent value="media" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" /> Featured Image{" "}
                      <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {image ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt="Selected image"
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={() => setImage(null)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300 p-4">
                        <FileUpload className="h-8 w-8 text-gray-400 mb-2" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImage(e.target.files?.[0] || null)}
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" /> PDF Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pdf ? (
                      <div className="relative">
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-gray-200">
                          <div className="text-center">
                            <FileText className="h-10 w-10 text-red-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">{pdf.name}</p>
                            <p className="text-xs text-gray-500">{(pdf.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={() => setPdf(null)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300 p-4">
                        <FileUpload className="h-8 w-8 text-gray-400 mb-2" />
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setPdf(e.target.files?.[0] || null)}
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>


              <Card className="border border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Youtube className="h-4 w-4 mr-2" /> YouTube Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste YouTube URL here"
                    />

                    {videoUrl && getEmbedUrl(videoUrl) ? (
                      <iframe
                        className="w-full aspect-video rounded-md"
                        src={getEmbedUrl(videoUrl)!}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video"
                      />
                    ) : videoUrl ? (
                      <p className="text-red-500 text-sm">
                        Invalid YouTube URL. Please enter a valid YouTube video link.
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base font-medium flex items-center">
                  <Link2 className="h-4 w-4 mr-2" /> Reference Link
                </Label>
                <Input
                  id="reference"
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="Add a reference URL for additional information"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t p-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Cancel
          </Button>
          <div className="space-x-2">
            <Button
              onClick={() => setIsPreview(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!title || !content}
            >
              Preview
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-700 hover:bg-green-800 text-white"
              disabled={!title || !content}
            >
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
