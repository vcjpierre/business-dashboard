import type { Client } from "@libsql/client"

let _db: Client | null = null
let _dbPromise: Promise<Client> | null = null

async function getDb(): Promise<Client> {
  if (_db) return _db
  if (_dbPromise) return _dbPromise

  _dbPromise = (async () => {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) throw new Error("TURSO_DATABASE_URL is not configured")
    const authToken = process.env.TURSO_AUTH_TOKEN

    const { createClient } = await import("@libsql/client")
    _db = createClient({ url, authToken: authToken || undefined })
    return _db
  })()

  return _dbPromise
}

export const db = new Proxy({} as Client, {
  get(_, prop: string) {
    return async (...args: any[]) => {
      const client = await getDb()
      return (client as any)[prop](...args)
    }
  },
})

export async function initDatabase() {
  const db = await getDb()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      business_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      acquired_date TEXT NOT NULL,
      revenue REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  console.log("Database initialized")
}
