import express from "express"
import cors from "cors"
import { initDatabase } from "./db.js"
import authRoutes from "./routes/auth.js"
import incomeRoutes from "./routes/incomes.js"
import expenseRoutes from "./routes/expenses.js"
import customerRoutes from "./routes/customers.js"
import dashboardRoutes from "./routes/dashboard.js"

export function createApp() {
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

  return app
}

// Solo arranca el server si NO estamos en Vercel (serverless)
const isVercel = process.env.VERCEL === "1"
if (!isVercel) {
  const PORT = process.env.PORT || 3001
  const app = createApp()
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
}
