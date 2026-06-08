import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { OverviewChart } from "../components/charts/OverviewChart"
import { ClientGrowthChart } from "../components/charts/ClientGrowthChart"
import { CategoryPieChart } from "../components/charts/CategoryPieChart"
import { api } from "../lib/api"
import { formatCurrency } from "../lib/utils"

export function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, c, cat] = await Promise.all([
          api.dashboard.summary(),
          api.dashboard.chart(6),
          api.dashboard.categoryBreakdown(),
        ])
        setSummary(s)
        setChartData(c)
        setCategoryData(cat)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const cards = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(summary?.totalIncome || 0),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(summary?.totalExpenses || 0),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Ganancia Neta",
      value: formatCurrency(summary?.netProfit || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Clientes",
      value: `${summary?.customerCount || 0}`,
      subtitle: `+${summary?.newCustomersThisMonth || 0} este mes`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientGrowthChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      {categoryData.length > 0 && (
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
              <CardTitle>Resumen Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chartData.map((d: any) => (
                  <div key={d.month} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="text-sm font-medium text-gray-600">{d.month}</span>
                    <div className="text-right">
                      <p className="text-sm text-green-600">+{formatCurrency(d.income || 0)}</p>
                      <p className="text-sm text-red-600">-{formatCurrency(d.expenses || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
