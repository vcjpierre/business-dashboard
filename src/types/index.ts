export type TimeRange = "7d" | "30d" | "90d" | "1y" | "custom"

export interface Income {
  id: number
  user_id: number
  amount: number
  source: string
  description: string | null
  date: string
  created_at: string
}

export interface Expense {
  id: number
  user_id: number
  amount: number
  category: string
  description: string | null
  date: string
  created_at: string
}

export interface Customer {
  id: number
  user_id: number
  name: string
  email: string | null
  phone: string | null
  acquired_date: string
  revenue: number
  created_at: string
}

export interface User {
  id: number
  email: string
  business_name: string
  created_at?: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  customerCount: number
  newCustomersThisMonth: number
  incomeGrowth: number
  expenseGrowth: number
  customerGrowth: number
}

export interface ChartDataPoint {
  date: string
  income?: number
  expenses?: number
  customers?: number
}

export interface CategoryBreakdown {
  name: string
  value: number
  color: string
}

export interface ExportFilters {
  startDate: string
  endDate: string
  type: "income" | "expense" | "customers" | "all"
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}
