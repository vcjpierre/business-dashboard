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
import type { Income } from "../types"

export function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState({ startDate: "", endDate: "", source: "" })

  const [form, setForm] = useState({ amount: "", source: "Ventas", description: "", date: "" })

  useEffect(() => {
    loadIncomes()
  }, [filters])

  const loadIncomes = async () => {
    setLoading(true)
    try {
      const data = await api.incomes.list({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        source: filters.source || undefined,
      })
      setIncomes(data as Income[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.amount || !form.date) return
    await api.incomes.create({
      amount: Number(form.amount),
      source: form.source,
      description: form.description || undefined,
      date: form.date,
    })
    setDialogOpen(false)
    setForm({ amount: "", source: "Ventas", description: "", date: "" })
    loadIncomes()
  }

  const handleDelete = async (id: number) => {
    await api.incomes.delete(id)
    loadIncomes()
  }

  const handleExport = () => {
    exportToCSV(
      incomes.map((i) => ({
        Fecha: formatShortDate(i.date),
        Monto: i.amount,
        Fuente: i.source,
        Descripción: i.description || "",
      })),
      "ingresos"
    )
  }

  const total = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ingresos</h2>
          <p className="text-sm text-gray-500">Total: {formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExportCSV={handleExport} isLoading={loading} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      <FilterBar
        onFilter={(f) => setFilters({ startDate: f.startDate, endDate: f.endDate, source: f.source || "" })}
        showSource
      />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : incomes.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay ingresos registrados</p>
          ) : (
            <div className="space-y-2">
              {incomes.map((income, i) => (
                <motion.div
                  key={income.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{income.source}</p>
                    <p className="text-sm text-gray-500">
                      {formatShortDate(income.date)}
                      {income.description && ` — ${income.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-green-600">
                      +{formatCurrency(income.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(income.id)}
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
        title="Nuevo Ingreso"
        description="Registrá una nueva fuente de ingreso"
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
            label="Fuente"
            value={form.source}
            onValueChange={(v) => setForm({ ...form, source: v })}
            options={[
              { value: "Ventas", label: "Ventas" },
              { value: "Servicios", label: "Servicios" },
              { value: "Consultoría", label: "Consultoría" },
              { value: "Inversiones", label: "Inversiones" },
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
            Guardar Ingreso
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
