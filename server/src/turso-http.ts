interface TursoRow {
  [key: string]: { type: string; value: unknown }
}

interface TursoResult {
  columns: { name: string; type: string }[]
  rows: TursoRow[]
}

interface ExecuteResult {
  rows: TursoResult["rows"]
  columns: TursoResult["columns"]
  lastInsertRowid?: bigint
  rowsAffected: number
}

export function createTursoClient() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) throw new Error("TURSO_DATABASE_URL is not configured")

  const isLocal = url.startsWith("file:")

  if (isLocal) {
    return createLocalClient(url)
  }

  const apiUrl = url.replace("libsql://", "https://")

  async function execute(sql: string, args: (string | number | null | bigint)[] = []) {
    const body = JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: { sql, args: args.map((a) => ({ type: typeof a === "bigint" ? "integer" : typeof a === "number" ? "real" : "text", value: a })) },
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
      const text = await res.text()
      throw new Error(`Turso HTTP error ${res.status}: ${text}`)
    }

    const data = await res.json()
    const result = data.results?.[0]?.response?.result

    return {
      rows: result?.rows || [],
      columns: result?.cols || [],
      lastInsertRowid: result?.last_insert_rowid,
      rowsAffected: result?.affected_row_count || 0,
    }
  }

  return {
    execute: (config: { sql: string; args?: any[] }) => execute(config.sql, config.args || []),
    close: () => {},
  }
}

function createLocalClient(url: string) {
  const { createClient } = require("@libsql/client")
  const client = createClient({ url })
  return client
}
