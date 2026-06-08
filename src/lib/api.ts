const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

function getToken(): string | null {
  return localStorage.getItem("token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: number; email: string; business_name: string } }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
    register: (email: string, password: string, businessName: string) =>
      request<{ token: string; user: { id: number; email: string; business_name: string } }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password, businessName }) }
      ),
  },
  dashboard: {
    summary: () => request<any>("/dashboard/summary"),
    chart: (months = 6) => request<any[]>(`/dashboard/chart?months=${months}`),
    categoryBreakdown: () => request<any[]>("/dashboard/category-breakdown"),
  },
  incomes: {
    list: (params?: { startDate?: string; endDate?: string; source?: string }) => {
      const q = new URLSearchParams()
      if (params?.startDate) q.set("startDate", params.startDate)
      if (params?.endDate) q.set("endDate", params.endDate)
      if (params?.source) q.set("source", params.source)
      return request<any[]>(`/incomes?${q}`)
    },
    create: (data: { amount: number; source: string; description?: string; date: string }) =>
      request<any>("/incomes", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/incomes/${id}`, { method: "DELETE" }),
  },
  expenses: {
    list: (params?: { startDate?: string; endDate?: string; category?: string }) => {
      const q = new URLSearchParams()
      if (params?.startDate) q.set("startDate", params.startDate)
      if (params?.endDate) q.set("endDate", params.endDate)
      if (params?.category) q.set("category", params.category)
      return request<any[]>(`/expenses?${q}`)
    },
    create: (data: { amount: number; category: string; description?: string; date: string }) =>
      request<any>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/expenses/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => request<any[]>("/customers"),
    create: (data: { name: string; email?: string; phone?: string; acquiredDate: string; revenue?: number }) =>
      request<any>("/customers", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/customers/${id}`, { method: "DELETE" }),
  },
}
