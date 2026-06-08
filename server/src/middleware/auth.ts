import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../auth.js"

export interface AuthRequest extends Request {
  userId?: number
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" })
  }

  const token = header.split(" ")[1]
  try {
    const decoded = verifyToken(token)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}
