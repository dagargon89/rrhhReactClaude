"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, BellOff, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { ConfigActions } from "./ConfigActions"

interface IncidentConfigsTableEnhancedProps {
  configs: any[]
}

const INCIDENT_TYPE_NAMES: Record<string, string> = {
  TURNOVER: "Rotación",
  ABSENTEEISM: "Ausentismo",
  TARDINESS: "Impuntualidad",
  OVERTIME: "Horas Extra",
}

const PERIOD_TYPE_NAMES: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
}

const OPERATOR_NAMES: Record<string, string> = {
  GT: ">",
  LT: "<",
  GTE: "≥",
  LTE: "≤",
  EQ: "=",
}

export function IncidentConfigsTableEnhanced({ configs }: IncidentConfigsTableEnhancedProps) {
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
    // Tipo de incidencia
    {
      accessorKey: "incidentType.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const config = row.original
        const typeName = config.incidentType.name
        return (
          <Badge className={`
            ${typeName === "TURNOVER" ? "bg-purple-100 text-purple-700 border-purple-200" : ""}
            ${typeName === "ABSENTEEISM" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
            ${typeName === "TARDINESS" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : ""}
            ${typeName === "OVERTIME" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
          `}>
            {INCIDENT_TYPE_NAMES[typeName] || typeName}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Departamento
    {
      accessorKey: "department.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Departamento" />
      ),
      cell: ({ row }) => {
        const config = row.original
        return config.department ? (
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{config.department.name}</p>
              <p className="text-xs text-muted-foreground">{config.department.code}</p>
            </div>
          </div>
        ) : (
          <Badge variant="outline">Global</Badge>
        )
      },
    },
    // Umbral
    {
      accessorKey: "thresholdValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Umbral" />
      ),
      cell: ({ row }) => {
        const config = row.original
        return (
          <Badge variant="secondary" className="font-mono">
            {OPERATOR_NAMES[config.thresholdOperator]} {parseFloat(config.thresholdValue).toFixed(2)}
          </Badge>
        )
      },
    },
    // Período
    {
      accessorKey: "periodType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Período" />
      ),
      cell: ({ row }) => {
        const periodType = row.getValue("periodType") as string
        return (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <Calendar className="h-3 w-3" />
            {PERIOD_TYPE_NAMES[periodType]}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Notificaciones
    {
      accessorKey: "notificationEnabled",
      header: "Notificaciones",
      cell: ({ row }) => {
        const config = row.original
        return config.notificationEnabled ? (
          <div className="space-y-1">
            <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 w-fit">
              <Bell className="h-3 w-3" />
              Activas
            </Badge>
            {config.notificationEmails.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {config.notificationEmails.length} destinatario(s)
              </p>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <BellOff className="h-3 w-3" />
            Desactivadas
          </Badge>
        )
      },
    },
    // Estado
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive")
        return (
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activa
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactiva
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <ConfigActions config={row.original} />
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={configs}
      deleteEndpoint="/api/incident-configs/bulk-delete"
      itemName="configuración"
    />
  )
}
