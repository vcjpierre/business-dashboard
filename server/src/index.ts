import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { initDatabase } from "./db.js"
import authRoutes from "./routes/auth.js"
import incomeRoutes from "./routes/incomes.js"
import expenseRoutes from "./routes/expenses.js"
import customerRoutes from "./routes/customers.js"
import dashboardRoutes from "./routes/dashboard.js"

dotenv.config({ path: "../.env" })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/incomes", incomeRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

async function start() {
  await initDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()
