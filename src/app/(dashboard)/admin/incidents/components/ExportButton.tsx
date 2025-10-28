"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportButtonProps {
  filters?: {
    startDate?: string
    endDate?: string
    incidentTypeId?: string
    departmentId?: string
  }
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true)
    try {
      // Construir URL con parámetros
      const params = new URLSearchParams()
      params.set("format", format)

      if (filters?.startDate) params.set("startDate", filters.startDate)
      if (filters?.endDate) params.set("endDate", filters.endDate)
      if (filters?.incidentTypeId) params.set("incidentTypeId", filters.incidentTypeId)
      if (filters?.departmentId) params.set("departmentId", filters.departmentId)

      const url = `/api/incidents/export?${params.toString()}`

      // Descargar archivo
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error al exportar")
      }

      // Obtener blob del archivo
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      // Obtener nombre del archivo del header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch ? filenameMatch[1] : `incidencias.${format}`

      // Crear link temporal y hacer click para descargar
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar URL temporal
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`)
    } catch (error) {
      console.error("Error exporting:", error)
      toast.error("Error al exportar incidencias")
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
