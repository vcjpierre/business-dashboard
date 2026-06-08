import { Router, Response } from "express"
import { db } from "../db.js"
import { AuthRequest, authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, category } = req.query
    let sql = "SELECT * FROM expenses WHERE user_id = ?"
    const args: any[] = [req.userId!]

    if (startDate && endDate) {
      sql += " AND date >= ? AND date <= ?"
      args.push(startDate, endDate)
    }
    if (category) {
      sql += " AND category = ?"
      args.push(category)
    }

    sql += " ORDER BY date DESC"
    const result = await db.execute({ sql, args })
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, description, date } = req.body
    if (!amount || !category || !date) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const result = await db.execute({
      sql: "INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)",
      args: [req.userId!, amount, category, description || null, date],
    })

    res.status(201).json({ id: Number(result.lastInsertRowid) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await db.execute({
      sql: "DELETE FROM expenses WHERE id = ? AND user_id = ?",
      args: [String(req.params.id), req.userId!],
    })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
