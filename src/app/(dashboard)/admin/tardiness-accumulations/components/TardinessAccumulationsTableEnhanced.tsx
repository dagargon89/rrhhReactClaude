"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface TardinessAccumulationsTableEnhancedProps {
  accumulations: any[]
}

export function TardinessAccumulationsTableEnhanced({ accumulations }: TardinessAccumulationsTableEnhancedProps) {
  const getRiskBadge = (formalTardies: number) => {
    if (formalTardies >= 5) {
      return <Badge variant="destructive">Acta pendiente</Badge>
    }
    if (formalTardies >= 4) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Alto Riesgo</Badge>
    }
    if (formalTardies >= 3) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Riesgo Medio</Badge>
    }
    if (formalTardies >= 1) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Riesgo Bajo</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700">Sin retardos</Badge>
  }

  const columns: ColumnDef<any>[] = [
    // Columna de selección
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // Código
    {
      accessorKey: "employee.employeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Código" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.original.employee.employeeCode}
        </div>
      ),
    },
    // Empleado
    {
      accessorKey: "employee.user.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const { firstName, lastName } = row.original.employee.user
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="font-medium">{firstName} {lastName}</div>
              {row.original.employee.department && (
                <div className="text-xs text-muted-foreground">
                  {row.original.employee.department.name}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    // Llegadas Tardías
    {
      accessorKey: "lateArrivalsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Llegadas Tardías" />
      ),
      cell: ({ row }) => {
        const count = row.getValue("lateArrivalsCount") as number
        return (
          <div className="text-center">
            <div className="font-medium text-yellow-600">{count}</div>
            <div className="text-xs text-muted-foreground">
              {count > 0 ? `${4 - (count % 4)} para retardo` : ""}
            </div>
          </div>
        )
      },
    },
    // Retardos Directos
    {
      accessorKey: "directTardinessCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Retardos Directos" />
      ),
      cell: ({ row }) => {
        const count = row.getValue("directTardinessCount") as number
        return (
          <div className="text-center font-medium text-orange-600">
            {count}
          </div>
        )
      },
    },
    // Retardos Formales
    {
      accessorKey: "formalTardiesCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Retardos Formales" />
      ),
      cell: ({ row }) => {
        const count = row.getValue("formalTardiesCount") as number
        return (
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{count}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {count >= 5 ? "¡Acta!" : count >= 4 ? `${5 - count} para acta` : ""}
            </div>
          </div>
        )
      },
    },
    // Actas
    {
      accessorKey: "administrativeActs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actas" />
      ),
      cell: ({ row }) => {
        const count = row.getValue("administrativeActs") as number
        if (count === 0) {
          return <span className="text-muted-foreground text-center block">-</span>
        }
        return (
          <div className="text-center">
            <Badge variant="destructive" className="font-bold">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {count}
            </Badge>
          </div>
        )
      },
    },
    // Nivel de Riesgo
    {
      id: "riskLevel",
      header: "Nivel de Riesgo",
      cell: ({ row }) => {
        return getRiskBadge(row.original.formalTardiesCount)
      },
    },
    // Acciones
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/tardiness-accumulations/employee/${row.original.employeeId}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver historial
            </Link>
          </Button>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={accumulations}
      deleteEndpoint="/api/tardiness-accumulations/bulk-delete"
      itemName="acumulación"
    />
  )
}
