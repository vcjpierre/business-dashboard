import { Router, Request, Response } from "express"
import { db } from "../db.js"
import { hashPassword, comparePassword, generateToken } from "../auth.js"

const router = Router()

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, businessName } = req.body
    if (!email || !password || !businessName) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    })
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const passwordHash = await hashPassword(password)
    const result = await db.execute({
      sql: "INSERT INTO users (email, password_hash, business_name) VALUES (?, ?, ?)",
      args: [email, passwordHash, businessName],
    })

    const userId = Number(result.lastInsertRowid)
    const token = generateToken(userId, email)

    res.status(201).json({
      token,
      user: { id: userId, email, business_name: businessName },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const result = await db.execute({
      sql: "SELECT id, email, password_hash, business_name FROM users WHERE email = ?",
      args: [email],
    })
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0] as any
    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = generateToken(user.id, user.email)
    res.json({
      token,
      user: { id: user.id, email: user.email, business_name: user.business_name },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
