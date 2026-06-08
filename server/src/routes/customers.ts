import { Router, Response } from "express"
import { db } from "../db.js"
import { AuthRequest, authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM customers WHERE user_id = ? ORDER BY acquired_date DESC",
      args: [req.userId!],
    })
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, acquiredDate, revenue } = req.body
    if (!name || !acquiredDate) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const result = await db.execute({
      sql: "INSERT INTO customers (user_id, name, email, phone, acquired_date, revenue) VALUES (?, ?, ?, ?, ?, ?)",
      args: [req.userId!, name, email || null, phone || null, acquiredDate, revenue || 0],
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
      sql: "DELETE FROM customers WHERE id = ? AND user_id = ?",
      args: [req.params.id, req.userId!],
    })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
