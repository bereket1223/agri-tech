import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Leaf, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CropRecommendationGuide() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-green-600" />
          How to Get Crop Recommendations
        </CardTitle>
        <CardDescription>Follow these steps to get personalized crop recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Step 1: Collect Soil Data</p>
              <p className="text-xs text-gray-600 mt-1">
                Gather information about your soil's NPK values, pH level, and moisture content. You can use a soil
                testing kit or send samples to a lab.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Step 2: Enter Enviromental Factors</p>
              <p className="text-xs text-gray-600 mt-1">
                Provide the enviromental factors to get climate-specific recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Step 3: Submit for Analysis</p>
              <p className="text-xs text-gray-600 mt-1">
                Our AI-powered system will analyze your soil data, local climate conditions, and historical crop
                performance to generate personalized recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Step 4: Review Results</p>
              <p className="text-xs text-gray-600 mt-1">
                You'll receive a list of recommended crops ranked by suitability, along with planting guidelines and
                expected yield estimates.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Link href="/dashboard/crop-recommendation">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Get Crop Recommendation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-2 text-center">
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
