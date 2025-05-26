"use client"
import { useState, useEffect } from "react"
import { Lightbulb, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const tips = [
  {
    id: 1,
    title: "Scheduled Reports",
    content:
      "Set up automated reports to be delivered to your email on a daily, weekly, or monthly basis from the Reports section.",
    category: "Analytics",
  },
  {
    id: 2,
    title: "Learning Tips",
    content:
      "Enhance your learning experience by exploring interactive tutorials and topic-wise progress tracking in the Learn section.",
    category: "Learning",
  },
  {
    id: 3,
    title: "View Analysis",
    content:
      "Use the Analytics dashboard to view trends, usage patterns, and performance insights in real-time.",
    category: "Analytics",
  },
];

export default function DailyTip() {
  const [currentTip, setCurrentTip] = useState(0)
  const [feedback, setFeedback] = useState<null | boolean>(null)

  // Get a random tip on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tips.length)
    setCurrentTip(randomIndex)
  }, [])

  const handleFeedback = (isHelpful: boolean) => {
    setFeedback(isHelpful)
    // Here you could send feedback to your API
    console.log(`Tip #${tips[currentTip].id} feedback:`, isHelpful ? "helpful" : "not helpful")
  }

  const tip = tips[currentTip]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="bg-amber-100 p-3 rounded-full shrink-0">
          <Lightbulb className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{tip.title}</h3>
          <p className="text-gray-600 text-sm">{tip.content}</p>
          <div className="flex items-center mt-3">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tip.category}</span>

            {feedback === null ? (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-1">Was this helpful?</span>
                <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleFeedback(true)}>
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  Yes
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleFeedback(false)}>
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  No
                </Button>
              </div>
            ) : (
              <div className="ml-auto">
                <span className="text-xs text-green-600 font-medium">
                  {feedback ? "Thanks for your feedback!" : "We'll improve our tips."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
