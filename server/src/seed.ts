import { db, initDatabase } from "./db.js"
import { hashPassword } from "./auth.js"

async function seed() {
  await initDatabase()

  const passwordHash = await hashPassword("admin123")
  const userResult = await db.execute({
    sql: "INSERT OR IGNORE INTO users (email, password_hash, business_name) VALUES (?, ?, ?)",
    args: ["admin@demo.com", passwordHash, "Mi Negocio Demo"],
  })

  const userId = 1

  const incomes = [
    { amount: 4500, source: "Ventas", date: "2025-01-15" },
    { amount: 3200, source: "Servicios", date: "2025-02-10" },
    { amount: 5100, source: "Ventas", date: "2025-03-05" },
    { amount: 4800, source: "Consultoría", date: "2025-04-20" },
    { amount: 5600, source: "Ventas", date: "2025-05-12" },
    { amount: 6200, source: "Servicios", date: "2025-06-08" },
  ]

  for (const inc of incomes) {
    await db.execute({
      sql: "INSERT INTO incomes (user_id, amount, source, date) VALUES (?, ?, ?, ?)",
      args: [userId, inc.amount, inc.source, inc.date],
    })
  }

  const expenses = [
    { amount: 1200, category: "Alquiler", date: "2025-01-01" },
    { amount: 800, category: "Servicios", date: "2025-02-01" },
    { amount: 1500, category: "Marketing", date: "2025-03-01" },
    { amount: 600, category: "Oficina", date: "2025-04-01" },
    { amount: 2000, category: "Salarios", date: "2025-05-01" },
    { amount: 900, category: "Marketing", date: "2025-06-01" },
  ]

  for (const exp of expenses) {
    await db.execute({
      sql: "INSERT INTO expenses (user_id, amount, category, date) VALUES (?, ?, ?, ?)",
      args: [userId, exp.amount, exp.category, exp.date],
    })
  }

  const customers = [
    { name: "Juan Pérez", email: "juan@example.com", date: "2025-01-10", revenue: 2500 },
    { name: "María García", email: "maria@example.com", date: "2025-02-15", revenue: 1800 },
    { name: "Carlos López", email: "carlos@example.com", date: "2025-03-20", revenue: 3200 },
    { name: "Ana Martínez", email: "ana@example.com", date: "2025-04-05", revenue: 1500 },
    { name: "Pedro Rodríguez", email: "pedro@example.com", date: "2025-05-12", revenue: 4100 },
    { name: "Laura Fernández", email: "laura@example.com", date: "2025-06-18", revenue: 2800 },
  ]

  for (const c of customers) {
    await db.execute({
      sql: "INSERT INTO customers (user_id, name, email, acquired_date, revenue) VALUES (?, ?, ?, ?, ?)",
      args: [userId, c.name, c.email, c.date, c.revenue],
    })
  }

  console.log("Seed data inserted successfully!")
  console.log("Login: admin@demo.com / admin123")
  process.exit(0)
}

seed().catch(console.error)
