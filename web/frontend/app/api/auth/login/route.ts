import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // In a real application, you would validate credentials against a database
    // For demo purposes, we'll use hardcoded values

    if (email === "admin@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        user: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
      })
    } else if (email === "user@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        user: {
          id: "user-123",
          name: "John Doe",
          email: "user@example.com",
          role: "user",
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}

