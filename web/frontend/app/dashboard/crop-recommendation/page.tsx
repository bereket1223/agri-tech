"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Leaf, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import Chat from "@/components/Chat"

interface CropData {
  Nitrogen: number
  Phosporus: number
  Potassium: number
  Temperature: number
  Humidity: number
  pH: number
  Rainfall: number
}

interface ResultRow extends CropData {
  recommendedCrop: string
  rowNumber: number
}

export default function CropRecommendationPage() {
  const [formData, setFormData] = useState({
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    temperature: 0,
    humidity: 0,
    ph: 0,
    rainfall: 0,
  })

  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bulkResults, setBulkResults] = useState<ResultRow[]>([])
  const [progress, setProgress] = useState(0)
  const [totalRows, setTotalRows] = useState(0)
  const [processedRows, setProcessedRows] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)


  const toggleChat = () => {
    setIsChatOpen((prev) => !prev)
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value[0],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setBulkResults([])
      setResult(null)
      setError(null)
    }
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if any values are zero
    const hasZeroValues = Object.values(formData).some((value) => value === 0)

    if (hasZeroValues) {
      setError("All input fields are required. Please set non-zero values for all parameters.")
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nitrogen: formData.nitrogen,
          Phosporus: formData.phosphorus,
          Potassium: formData.potassium,
          Temperature: formData.temperature,
          Humidity: formData.humidity,
          pH: formData.ph,
          Rainfall: formData.rainfall,
        }),
      })

      const data = await res.json()
      console.log("response data", data)

      if (!res.ok) throw new Error(data.error || "Something went wrong")

      setResult(data.message || "Success")
    } catch (err) {
      console.error(err)
      setError("Failed to fetch recommendation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const parseCSV = (text: string): CropData[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    // Map CSV headers to our expected property names
    const headerMap: Record<string, keyof CropData> = {
      N: "Nitrogen",
      P: "Phosporus",
      K: "Potassium",
      temperature: "Temperature",
      humidity: "Humidity",
      ph: "pH",
      rainfall: "Rainfall",
      // Add any other possible header variations
      Nitrogen: "Nitrogen",
      Phosporus: "Phosporus",
      Potassium: "Potassium",
      Temperature: "Temperature",
      Humidity: "Humidity",
      pH: "pH",
      Rainfall: "Rainfall",
    }

    const results: CropData[] = []

    // Start from index 1 to skip headers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines

      const values = line.split(",").map((v) => v.trim())
      const rowData: Partial<CropData> = {}

      headers.forEach((header, index) => {
        const mappedHeader = headerMap[header]
        if (mappedHeader) {
          rowData[mappedHeader] = Number.parseFloat(values[index])
        }
      })

      // Only add if we have all required fields
      if (
        rowData.Nitrogen !== undefined &&
        rowData.Phosporus !== undefined &&
        rowData.Potassium !== undefined &&
        rowData.Temperature !== undefined &&
        rowData.Humidity !== undefined &&
        rowData.pH !== undefined &&
        rowData.Rainfall !== undefined
      ) {
        results.push(rowData as CropData)
      }
    }

    return results
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    setError(null)
    setBulkResults([])
    setProgress(0)
    setProcessedRows(0)

    if (!file) {
      setError("Please select a CSV file to upload.")
      setIsLoading(false)
      return
    }

    try {
      // Read the file content
      const fileContent = await file.text()
      const rows = parseCSV(fileContent)

      if (rows.length === 0) {
        throw new Error("No valid data found in the CSV file")
      }

      setTotalRows(rows.length)
      const results: ResultRow[] = []

      // Process each row sequentially
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]

        try {
          const res = await fetch("http://localhost:8000/api/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(row),
          })

          const data = await res.json()

          if (!res.ok) {
            console.error(`Error processing row ${i + 1}:`, data.error)
            results.push({
              ...row,
              recommendedCrop: "Error: " + (data.error || "Failed to process"),
              rowNumber: i + 1,
            })
          } else {
            results.push({
              ...row,
              recommendedCrop: data.message || "Unknown",
              rowNumber: i + 1,
            })
          }
        } catch (err) {
          console.error(`Error processing row ${i + 1}:`, err)
          results.push({
            ...row,
            recommendedCrop: "Error: Request failed",
            rowNumber: i + 1,
          })
        }

        // Update progress
        setProcessedRows(i + 1)
        setProgress(Math.round(((i + 1) / rows.length) * 100))

        // Update results as we go
        setBulkResults([...results])
      }

      setResult(`Successfully processed ${results.length} rows`)
    } catch (err) {
      console.error(err)
      setError("Failed to process the file: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }

  const downloadCSV = () => {
    if (bulkResults.length === 0) return

    const headers = [
      "Row",
      "Nitrogen",
      "Phosphorus",
      "Potassium",
      "Temperature",
      "Humidity",
      "pH",
      "Rainfall",
      "Recommended Crop",
    ]
    const csvRows = [
      headers.join(","),
      ...bulkResults.map((row) =>
        [
          row.rowNumber,
          row.Nitrogen,
          row.Phosporus,
          row.Potassium,
          row.Temperature,
          row.Humidity,
          row.pH,
          row.Rainfall,
          row.recommendedCrop,
        ].join(","),
      ),
    ]

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "crop_recommendations.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">Smart Crop Recommendation</h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Get personalized crop recommendations based on soil composition and environmental factors.
          </p>
        </div>

        <Tabs defaultValue="single" className="mb-8">
          <TabsList className="mb-6 mx-auto flex justify-center">
            <TabsTrigger value="single" className="flex items-center">
              <Leaf className="mr-2 h-4 w-4" />
              Single Prediction
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Bulk Analysis
            </TabsTrigger>
          </TabsList>

          {/* Single Prediction */}
          <TabsContent value="single">
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="text-2xl text-green-800 flex items-center">
                  <Leaf className="mr-2 h-5 w-5" />
                  Single Crop Recommendation
                </CardTitle>
                <CardDescription className="text-green-700">
                  Enter soil parameters and environmental conditions to get a crop recommendation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Important:</strong> All input fields are required. Please set non-zero values for all
                    parameters to get accurate crop recommendations.
                  </div>
                </div>
                <form onSubmit={handleSingleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6 p-4 rounded-lg bg-green-50/50">
                      <h3 className="font-medium text-green-800 border-b border-green-100 pb-2">Soil Nutrients</h3>

                      {/* Nitrogen */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="nitrogen" className="text-sm font-medium">
                            Nitrogen (N)
                          </Label>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.nitrogen} mg/kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0</span>
                          <Slider
                            id="nitrogen"
                            min={0}
                            max={140}
                            step={1}
                            value={[formData.nitrogen]}
                            onValueChange={(v) => handleSliderChange("nitrogen", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">140</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Recommended range: 40-80 mg/kg</p>
                        {formData.nitrogen === 0 && <p className="text-xs text-red-500 mt-1">This field is required</p>}
                      </div>

                      {/* Phosphorus */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="phosphorus" className="text-sm font-medium">
                            Phosphorus (P)
                          </Label>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.phosphorus} mg/kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0</span>
                          <Slider
                            id="phosphorus"
                            min={0}
                            max={140}
                            step={1}
                            value={[formData.phosphorus]}
                            onValueChange={(v) => handleSliderChange("phosphorus", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">140</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Recommended range: 30-60 mg/kg</p>
                        {formData.phosphorus === 0 && (
                          <p className="text-xs text-red-500 mt-1">This field is required</p>
                        )}
                      </div>

                      {/* Potassium */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="potassium" className="text-sm font-medium">
                            Potassium (K)
                          </Label>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.potassium} mg/kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0</span>
                          <Slider
                            id="potassium"
                            min={0}
                            max={140}
                            step={1}
                            value={[formData.potassium]}
                            onValueChange={(v) => handleSliderChange("potassium", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">140</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Recommended range: 25-50 mg/kg</p>
                        {formData.potassium === 0 && (
                          <p className="text-xs text-red-500 mt-1">This field is required</p>
                        )}
                      </div>

                      {/* pH */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="ph" className="text-sm font-medium">
                            pH Level
                          </Label>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.ph}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0</span>
                          <Slider
                            id="ph"
                            min={0}
                            max={14}
                            step={0.1}
                            value={[formData.ph]}
                            onValueChange={(v) => handleSliderChange("ph", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">14</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Optimal range: 5.5-7.5 (neutral)</p>
                        {formData.ph === 0 && <p className="text-xs text-red-500 mt-1">This field is required</p>}
                      </div>
                    </div>

                    <div className="space-y-6 p-4 rounded-lg bg-blue-50/50">
                      <h3 className="font-medium text-blue-800 border-b border-blue-100 pb-2">Environmental Factors</h3>

                      {/* Temperature */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="temperature" className="text-sm font-medium">
                            Temperature
                          </Label>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.temperature} °C
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0°C</span>
                          <Slider
                            id="temperature"
                            min={0}
                            max={50}
                            step={0.1}
                            value={[formData.temperature]}
                            onValueChange={(v) => handleSliderChange("temperature", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">50°C</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Most crops: 15-30°C</p>
                        {formData.temperature === 0 && (
                          <p className="text-xs text-red-500 mt-1">This field is required</p>
                        )}
                      </div>

                      {/* Humidity */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="humidity" className="text-sm font-medium">
                            Humidity
                          </Label>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0%</span>
                          <Slider
                            id="humidity"
                            min={0}
                            max={100}
                            step={1}
                            value={[formData.humidity]}
                            onValueChange={(v) => handleSliderChange("humidity", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">100%</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Ideal range: 40-80%</p>
                        {formData.humidity === 0 && <p className="text-xs text-red-500 mt-1">This field is required</p>}
                      </div>

                      {/* Rainfall */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="rainfall" className="text-sm font-medium">
                            Rainfall
                          </Label>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {formData.rainfall} mm
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">0mm</span>
                          <Slider
                            id="rainfall"
                            min={0}
                            max={300}
                            step={1}
                            value={[formData.rainfall]}
                            onValueChange={(v) => handleSliderChange("rainfall", v)}
                            className="flex-1"
                          />
                          <span className="text-xs text-gray-500">300mm</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Varies by crop: 50-200mm</p>
                        {formData.rainfall === 0 && <p className="text-xs text-red-500 mt-1">This field is required</p>}
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoading || Object.values(formData).some((value) => value === 0)}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            "Get Crop Recommendation"
                          )}
                        </Button>
                       
                      </div>
                    </div>
                  </div>
                </form>
                  
                  <div className="flex justify-content-end pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoading || result === null}
                          onClick={toggleChat}
                        > Consult AI
                        </Button>
                       
                   </div>

            


                 



                {result && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-green-800">Recommended Crop</h3>
                        <div className="mt-2 text-green-700 text-xl font-semibold">{result}</div>
                        <p className="mt-2 text-sm text-green-600">
                          Based on your soil parameters and environmental conditions, this crop is likely to thrive.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert className="mt-6 bg-red-50 border-red-200" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Upload - Keep the existing implementation */}
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Crop Analysis</CardTitle>
                <CardDescription>
                  Upload a CSV file with soil samples for batch crop predictions. Each row will be processed
                  individually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a CSV file. Required columns: <code>N,P,K,temperature,humidity,ph,rainfall</code>
                    </p>
                    <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleFileChange} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("csv-upload")?.click()}
                    >
                      Browse File
                    </Button>
                    {file && <p className="text-sm text-green-600 mt-2">Selected file: {file.name}</p>}
                  </div>

                  <Button type="submit" className="bg-green-600 text-white" disabled={isLoading || !file}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Analyze CSV Data"
                    )}
                  </Button>
                </form>

                {isLoading && totalRows > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing rows...</span>
                      <span>
                        {processedRows} of {totalRows} ({progress}%)
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {bulkResults.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Results</h3>
                      <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">Row</TableHead>
                            <TableHead>N</TableHead>
                            <TableHead>P</TableHead>
                            <TableHead>K</TableHead>
                            <TableHead>Temp</TableHead>
                            <TableHead>Humidity</TableHead>
                            <TableHead>pH</TableHead>
                            <TableHead>Rainfall</TableHead>
                            <TableHead className="min-w-[150px]">Recommended Crop</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkResults.map((row, index) => (
                            <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                              <TableCell>{row.rowNumber}</TableCell>
                              <TableCell>{row.Nitrogen}</TableCell>
                              <TableCell>{row.Phosporus}</TableCell>
                              <TableCell>{row.Potassium}</TableCell>
                              <TableCell>{row.Temperature}</TableCell>
                              <TableCell>{row.Humidity}</TableCell>
                              <TableCell>{row.pH}</TableCell>
                              <TableCell>{row.Rainfall}</TableCell>
                              <TableCell
                                className={row.recommendedCrop.startsWith("Error") ? "text-red-600" : "text-green-600"}
                              >
                                {row.recommendedCrop}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {result && !isLoading && (
                  <Alert className="mt-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Bulk Prediction Complete</AlertTitle>
                    <AlertDescription>{result}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mt-6 bg-red-50 border-red-200" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About Crop Recommendation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-green-800 mb-2">Soil Analysis</h3>
              <p className="text-sm text-gray-600">
                Our system analyzes soil nutrient levels (N, P, K) and pH to determine optimal crop choices.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-blue-800 mb-2">Environmental Factors</h3>
              <p className="text-sm text-gray-600">
                Temperature, humidity, and rainfall patterns are critical for determining crop suitability.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-amber-50">
              <div className="bg-amber-100 p-3 rounded-full mb-3">
                <CheckCircle2 className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-amber-800 mb-2">AI-Powered Recommendations</h3>
              <p className="text-sm text-gray-600">
                Our machine learning model analyzes all factors to recommend the most suitable crop for your conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

           {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleChat}
          ></div>
          <div className="fixed bottom-0 right-0 md:bottom-auto md:right-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-1/3 h-3/4 bg-white shadow-lg border border-gray-300 z-50">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h2 className="text-lg font-bold">Agripridict AI chat</h2>
              <button
                onClick={toggleChat}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <Chat formData={formData} />
            </div>
          </div>
        </>
      )}


    </div>
  )
}
