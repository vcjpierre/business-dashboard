import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Tabs, TabsContent } from "../components/ui/Tabs"
import { IncomeExpenseChart } from "../components/charts/IncomeExpenseChart"
import { ClientGrowthChart } from "../components/charts/ClientGrowthChart"
import { CategoryPieChart } from "../components/charts/CategoryPieChart"
import { FilterBar } from "../components/filters/FilterBar"
import { api } from "../lib/api"
import { formatCurrency } from "../lib/utils"

export function Reports() {
  const [activeTab, setActiveTab] = useState("financial")
  const [chartData, setChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [c, cat] = await Promise.all([
        api.dashboard.chart(12),
        api.dashboard.categoryBreakdown(),
      ])
      setChartData(c)
      setCategoryData(cat)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const totalIncome = chartData.reduce((s: number, d: any) => s + (d.income || 0), 0)
  const totalExpenses = chartData.reduce((s: number, d: any) => s + (d.expenses || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes</h2>
          <p className="text-sm text-gray-500">Análisis detallado de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const content = [
              ["Métrica", "Valor"],
              ["Ingresos Totales", formatCurrency(totalIncome)],
              ["Gastos Totales", formatCurrency(totalExpenses)],
              ["Ganancia Neta", formatCurrency(totalIncome - totalExpenses)],
            ].map(r => r.join(",")).join("\n")

            const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            link.href = URL.createObjectURL(blob)
            link.download = "reporte-financiero.csv"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)
          }}>
            <Download className="h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} tabs={[
        { value: "financial", label: "Financiero" },
        { value: "customers", label: "Clientes" },
        { value: "categories", label: "Categorías" },
      ]}>
        <TabsContent value="financial">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos vs Gastos (12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart data={chartData} />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-gray-500">Gastos Totales</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-gray-500">Ganancia Neta</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(totalIncome - totalExpenses)}</p>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Crecimiento de Clientes (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientGrowthChart data={chartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={categoryData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desglose</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm text-gray-600">{cat.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
