// frontend/lib/fetch-dashboard.ts
export async function fetchDashboardStats() {
    const res = await fetch("http://localhost:5000/api/admin/stats")
    if (!res.ok) throw new Error("Failed to fetch dashboard stats")
    return await res.json()
  }
  