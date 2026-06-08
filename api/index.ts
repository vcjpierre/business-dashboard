import type { Request, Response } from "express"

let handler: ((req: Request, res: Response) => void) | null = null

async function init() {
  const { createApp } = await import("../server/src/index")
  const { initDatabase } = await import("../server/src/db")
  const app = createApp()

  try {
    await initDatabase()
  } catch (e) {
    console.error("DB init failed (non-fatal):", e)
  }

  handler = (req: Request, res: Response) => {
    app(req, res)
  }
}

export default async function apiHandler(req: Request, res: Response) {
  if (!handler) {
    await init()
  }
  handler!(req, res)
}
