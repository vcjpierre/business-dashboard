import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Mail, Phone } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Dialog } from "../components/ui/Dialog"
import { ExportButton, exportToCSV } from "../components/export/ExportButton"
import { api } from "../lib/api"
import { formatCurrency, formatShortDate } from "../lib/utils"
import type { Customer } from "../types"

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", acquiredDate: "", revenue: "" })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await api.customers.list()
      setCustomers(data as Customer[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.name || !form.acquiredDate) return
    await api.customers.create({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      acquiredDate: form.acquiredDate,
      revenue: form.revenue ? Number(form.revenue) : undefined,
    })
    setDialogOpen(false)
    setForm({ name: "", email: "", phone: "", acquiredDate: "", revenue: "" })
    loadCustomers()
  }

  const handleDelete = async (id: number) => {
    await api.customers.delete(id)
    loadCustomers()
  }

  const handleExport = () => {
    exportToCSV(
      customers.map((c) => ({
        Nombre: c.name,
        Email: c.email || "",
        Teléfono: c.phone || "",
        "Fecha Adquisición": formatShortDate(c.acquired_date),
        Ingresos: c.revenue,
      })),
      "clientes"
    )
  }

  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-gray-500">
            {customers.length} clientes — Ingresos totales: {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExportCSV={handleExport} isLoading={loading} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : customers.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay clientes registrados</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {customers.map((customer, i) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <div className="mt-1 space-y-1">
                        {customer.email && (
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3 w-3" /> {customer.phone}
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        Desde {formatShortDate(customer.acquired_date)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 border-t pt-2">
                    <span className="text-sm text-gray-500">Ingresos generados:</span>
                    <p className="font-semibold text-green-600">{formatCurrency(customer.revenue)}</p>
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
        title="Nuevo Cliente"
        description="Registrá un nuevo cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre del cliente"
          />
          <Input
            label="Email (opcional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Teléfono (opcional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Fecha de adquisición"
            type="date"
            value={form.acquiredDate}
            onChange={(e) => setForm({ ...form, acquiredDate: e.target.value })}
          />
          <Input
            label="Ingresos generados"
            type="number"
            value={form.revenue}
            onChange={(e) => setForm({ ...form, revenue: e.target.value })}
            placeholder="0.00"
          />
          <Button onClick={handleCreate} className="w-full">
            Guardar Cliente
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
