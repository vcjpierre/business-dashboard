import express from "express"
import cors from "cors"
import { initDatabase } from "../server/src/db.js"
import authRoutes from "../server/src/routes/auth.js"
import incomeRoutes from "../server/src/routes/incomes.js"
import expenseRoutes from "../server/src/routes/expenses.js"
import customerRoutes from "../server/src/routes/customers.js"
import dashboardRoutes from "../server/src/routes/dashboard.js"

const app = express()

app.use(cors({ origin: "*", credentials: true }))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/incomes", incomeRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

await initDatabase()

export default app
