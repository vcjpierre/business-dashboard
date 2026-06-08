let _db: any = null
let _dbPromise: Promise<any> | null = null

async function createHttpClient() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error("TURSO_DATABASE_URL is not configured")

  const apiUrl = url.replace("libsql://", "https://")
  const authToken = process.env.TURSO_AUTH_TOKEN

  async function execute(config: { sql: string; args?: any[] }) {
    const body = JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql: config.sql,
            args: (config.args || []).map((a: any) => ({
              type: a === null ? "null" : typeof a === "number" ? "real" : "text",
              value: a,
            })),
          },
        },
      ],
    })

    const res = await fetch(`${apiUrl}/v2/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!res.ok) {
      throw new Error(`Turso HTTP ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    const r = data.results?.[0]?.response?.result

    if (!r) return { rows: [], columns: [], lastInsertRowid: undefined, rowsAffected: 0 }

    const colNames = (r.cols || []).map((c: any) => c.name)

    const rows = (r.rows || []).map((cells: any[]) => {
      const row: Record<string, any> = {}
      colNames.forEach((name: string, i: number) => {
        row[name] = cells[i]?.value ?? null
      })
      return row
    })

    return {
      rows,
      columns: r.cols || [],
      lastInsertRowid: r.last_insert_rowid ? BigInt(r.last_insert_rowid) : undefined,
      rowsAffected: r.affected_row_count || 0,
    }
  }

  return { execute, close: () => {} }
}

export async function getDb() {
  if (_db) return _db
  if (_dbPromise) return _dbPromise

  _dbPromise = (async () => {
    const url = process.env.TURSO_DATABASE_URL

    if (url && url.startsWith("file:")) {
      // Local SQLite — necesita @libsql/client con bindings nativos
      const { createClient } = await import("@libsql/client")
      _db = createClient({ url })
      return _db
    }

    // Remoto (libsql:// o https://) — HTTP puro sin bindings nativos
    _db = await createHttpClient()
    return _db
  })()

  return _dbPromise
}

export const db = new Proxy({} as any, {
  get(_, prop: string) {
    return async (...args: any[]) => {
      const client = await getDb()
      return client[prop](...args)
    }
  },
})

export async function initDatabase() {
  const client = await getDb()
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      business_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      acquired_date TEXT NOT NULL,
      revenue REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  ]) {
    await client.execute({ sql })
  }
  console.log("Database initialized")
}
