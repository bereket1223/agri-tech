"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Clock, ArrowLeft, XCircle, AlertTriangle } from "lucide-react"

export default function AccountStatusPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("pending")
  const [rejectionReason, setRejectionReason] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Get status from URL parameters
    const statusParam = searchParams.get("status")
    const reasonParam = searchParams.get("reason")
    const emailParam = searchParams.get("email")

    if (statusParam === "rejected") {
      setStatus("rejected")
    } else {
      setStatus("pending")
    }

    if (reasonParam) {
      setRejectionReason(decodeURIComponent(reasonParam))
    }

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Leaf className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === "rejected" ? "Account Access Denied" : "Account Pending Approval"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center text-center">
            {status === "rejected" ? (
              // Rejected account UI
              <>
                <div className="bg-red-100 p-3 rounded-full mb-6">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>

                <p className="text-lg text-gray-700 mb-4">Your account registration has been rejected.</p>

                {rejectionReason && (
                  <div className="w-full mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800 text-left">Reason for rejection:</h3>
                          <div className="mt-2 text-sm text-red-700 text-left">
                            <p>{rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-600 mb-8">
                  If you believe this is an error or would like to provide additional information, please contact our
                  support team.
                </p>
              </>
            ) : (
              // Pending approval UI
              <>
                <div className="bg-yellow-100 p-3 rounded-full mb-6">
                  <Clock className="h-12 w-12 text-yellow-600" />
                </div>

                <p className="text-lg text-gray-700 mb-6">
                  Thank you for registering! Your account is currently pending approval from our administrators.
                </p>

                <p className="text-gray-600 mb-8">
                  We'll send you an email notification once your account has been approved. This usually takes 1-2
                  business days.
                </p>
              </>
            )}

            <div className="space-y-4 w-full">
              <Link href="/">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </Link>

              <Link href="/contact">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
