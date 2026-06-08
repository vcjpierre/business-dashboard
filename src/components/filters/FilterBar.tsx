import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Calendar } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"

interface FilterBarProps {
  onFilter: (filters: { startDate: string; endDate: string; category?: string; source?: string }) => void
  showCategory?: boolean
  showSource?: boolean
}

export function FilterBar({ onFilter, showCategory, showSource }: FilterBarProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [category, setCategory] = useState("")
  const [source, setSource] = useState("")

  const handleApply = () => {
    onFilter({
      startDate,
      endDate,
      ...(showCategory && category ? { category } : {}),
      ...(showSource && source ? { source } : {}),
    })
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    setCategory("")
    setSource("")
    onFilter({ startDate: "", endDate: "" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4"
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <span className="text-gray-400">—</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>

      {showCategory && (
        <Select
          value={category}
          onValueChange={setCategory}
          placeholder="Todas las categorías"
          options={[
            { value: "Alquiler", label: "Alquiler" },
            { value: "Servicios", label: "Servicios" },
            { value: "Marketing", label: "Marketing" },
            { value: "Salarios", label: "Salarios" },
            { value: "Oficina", label: "Oficina" },
            { value: "Otros", label: "Otros" },
          ]}
          className="w-44"
        />
      )}

      {showSource && (
        <Select
          value={source}
          onValueChange={setSource}
          placeholder="Todas las fuentes"
          options={[
            { value: "Ventas", label: "Ventas" },
            { value: "Servicios", label: "Servicios" },
            { value: "Consultoría", label: "Consultoría" },
            { value: "Inversiones", label: "Inversiones" },
            { value: "Otros", label: "Otros" },
          ]}
          className="w-44"
        />
      )}

      <div className="flex gap-2">
        <Button variant="default" size="sm" onClick={handleApply}>
          <Search className="h-4 w-4" />
          Filtrar
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
      </div>
    </motion.div>
  )
}
