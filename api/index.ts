import { createApp } from "../server/src/index"
import { initDatabase } from "../server/src/db"

const app = createApp()

// Inicializar DB en cada cold start de serverless
await initDatabase()

export default app
