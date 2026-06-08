let handler: ((req: any, res: any) => void) | null = null

async function init() {
  const mod = await import("../server/src/index")
  const dbMod = await import("../server/src/db")
  const app = mod.createApp()

  try {
    await dbMod.initDatabase()
  } catch (e) {
    console.error("DB init failed (non-fatal):", e)
  }

  handler = (req: any, res: any) => {
    app(req, res)
  }
}

export default async function apiHandler(req: any, res: any) {
  if (!handler) {
    await init()
  }
  handler!(req, res)
}
