import { useState } from "react"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"

interface ExportButtonProps {
  onExportCSV: () => void
  onExportPDF?: () => void
  isLoading?: boolean
}

export function ExportButton({ onExportCSV, onExportPDF, isLoading }: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-44 overflow-hidden rounded-lg border bg-white p-1 shadow-lg animate-in fade-in zoom-in-95"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onClick={() => { onExportCSV(); setOpen(false) }}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Exportar CSV
          </DropdownMenu.Item>
          {onExportPDF && (
            <DropdownMenu.Item
              onClick={() => { onExportPDF(); setOpen(false) }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 text-red-600" />
              Exportar PDF
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ""
        const str = String(val)
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(",")
    ),
  ].join("\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
