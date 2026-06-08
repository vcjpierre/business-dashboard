import { createClient, type Client } from "@libsql/client"

let _db: Client | null = null
let _error: Error | null = null

export function getDb(): Client {
  if (_db) return _db
  if (_error) throw _error

  const url = process.env.TURSO_DATABASE_URL
  if (!url) {
    _error = new Error("TURSO_DATABASE_URL is not configured")
    throw _error
  }

  const authToken = process.env.TURSO_AUTH_TOKEN

  _db = createClient({
    url,
    authToken: authToken || undefined,
  })

  return _db
}

export const db = new Proxy({} as Client, {
  get(_, prop) {
    const client = getDb()
    const value = client[prop as keyof Client]
    return typeof value === "function" ? value.bind(client) : value
  },
})

export async function initDatabase() {
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
