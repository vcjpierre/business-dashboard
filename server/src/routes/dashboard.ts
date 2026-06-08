import { Router, Response } from "express"
import { db } from "../db.js"
import { AuthRequest, authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/summary", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]

    const [incomeResult, expenseResult, customerResult, customerCount] = await Promise.all([
      db.execute({
        sql: "SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ?",
        args: [userId],
      }),
      db.execute({
        sql: "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?",
        args: [userId],
      }),
      db.execute({
        sql: "SELECT COUNT(*) as count FROM customers WHERE user_id = ?",
        args: [userId],
      }),
      db.execute({
        sql: "SELECT COUNT(*) as count FROM customers WHERE user_id = ? AND acquired_date >= ?",
        args: [userId, firstOfMonth],
      }),
    ])

    const totalIncome = Number((incomeResult.rows[0] as any).total)
    const totalExpenses = Number((expenseResult.rows[0] as any).total)
    const customerCountVal = Number((customerResult.rows[0] as any).count)
    const newCustomers = Number((customerCount.rows[0] as any).count)

    res.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      customerCount: customerCountVal,
      newCustomersThisMonth: newCustomers,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/chart", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { months = 6 } = req.query

    const incomeTrend = await db.execute({
      sql: `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
            FROM incomes WHERE user_id = ?
            GROUP BY month ORDER BY month ASC LIMIT ?`,
      args: [userId, Number(months)],
    })

    const expenseTrend = await db.execute({
      sql: `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
            FROM expenses WHERE user_id = ?
            GROUP BY month ORDER BY month ASC LIMIT ?`,
      args: [userId, Number(months)],
    })

    const customerTrend = await db.execute({
      sql: `SELECT strftime('%Y-%m', acquired_date) as month, COUNT(*) as total
            FROM customers WHERE user_id = ?
            GROUP BY month ORDER BY month ASC LIMIT ?`,
      args: [userId, Number(months)],
    })

    const incomeMap = new Map(incomeTrend.rows.map((r: any) => [r.month, Number(r.total)]))
    const expenseMap = new Map(expenseTrend.rows.map((r: any) => [r.month, Number(r.total)]))
    const customerMap = new Map(customerTrend.rows.map((r: any) => [r.month, Number(r.total)]))

    const allMonths = new Set([
      ...incomeMap.keys(),
      ...expenseMap.keys(),
      ...customerMap.keys(),
    ])

    const chartData = Array.from(allMonths).sort().map((month) => ({
      month,
      income: incomeMap.get(month) || 0,
      expenses: expenseMap.get(month) || 0,
      customers: customerMap.get(month) || 0,
    }))

    res.json(chartData)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/category-breakdown", async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute({
      sql: `SELECT category, SUM(amount) as total
            FROM expenses WHERE user_id = ?
            GROUP BY category ORDER BY total DESC`,
      args: [req.userId!],
    })

    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]
    const breakdown = result.rows.map((r: any, i: number) => ({
      name: r.category,
      value: Number(r.total),
      color: colors[i % colors.length],
    }))

    res.json(breakdown)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
