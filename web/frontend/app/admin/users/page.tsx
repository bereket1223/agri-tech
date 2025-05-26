"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserManagement from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <div>
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all registered users</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UserManagement />
        </CardContent>
      </Card>
    </div>
  )
}
