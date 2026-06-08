import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import { Dialog } from "../components/ui/Dialog"
import { FilterBar } from "../components/filters/FilterBar"
import { ExportButton, exportToCSV } from "../components/export/ExportButton"
import { api } from "../lib/api"
import { formatCurrency, formatShortDate } from "../lib/utils"
import type { Expense } from "../types"

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState({ startDate: "", endDate: "", category: "" })
  const [form, setForm] = useState({ amount: "", category: "Oficina", description: "", date: "" })

  useEffect(() => {
    loadExpenses()
  }, [filters])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const data = await api.expenses.list({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        category: filters.category || undefined,
      })
      setExpenses(data as Expense[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.amount || !form.date) return
    await api.expenses.create({
      amount: Number(form.amount),
      category: form.category,
      description: form.description || undefined,
      date: form.date,
    })
    setDialogOpen(false)
    setForm({ amount: "", category: "Oficina", description: "", date: "" })
    loadExpenses()
  }

  const handleDelete = async (id: number) => {
    await api.expenses.delete(id)
    loadExpenses()
  }

  const handleExport = () => {
    exportToCSV(
      expenses.map((e) => ({
        Fecha: formatShortDate(e.date),
        Monto: e.amount,
        Categoría: e.category,
        Descripción: e.description || "",
      })),
      "gastos"
    )
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gastos</h2>
          <p className="text-sm text-gray-500">Total: {formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExportCSV={handleExport} isLoading={loading} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      <FilterBar
        onFilter={(f) => setFilters({ startDate: f.startDate, endDate: f.endDate, category: f.category || "" })}
        showCategory
      />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay gastos registrados</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-gray-500">
                      {formatShortDate(expense.date)}
                      {expense.description && ` — ${expense.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nuevo Gasto"
        description="Registrá un nuevo gasto"
      >
        <div className="space-y-4">
          <Input
            label="Monto"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
          <Select
            label="Categoría"
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
            options={[
              { value: "Alquiler", label: "Alquiler" },
              { value: "Servicios", label: "Servicios" },
              { value: "Marketing", label: "Marketing" },
              { value: "Salarios", label: "Salarios" },
              { value: "Oficina", label: "Oficina" },
              { value: "Otros", label: "Otros" },
            ]}
          />
          <Input
            label="Descripción (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Button onClick={handleCreate} className="w-full">
            Guardar Gasto
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
