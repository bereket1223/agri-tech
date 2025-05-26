import { redirect } from "next/navigation"

export default function PendingApprovalPage() {
  // Redirect to the new account status page
  redirect("/auth/account-status?status=pending")

  // This component won't render as we're redirecting
  return null
}
