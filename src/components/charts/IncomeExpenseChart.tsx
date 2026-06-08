import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { motion } from "framer-motion"

interface DataPoint {
  month: string
  income?: number
  expenses?: number
}

export function IncomeExpenseChart({ data }: { data: DataPoint[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Ingresos"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6" }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Gastos"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
