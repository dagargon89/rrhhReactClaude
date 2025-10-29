"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet, Search, X, Calendar } from "lucide-react"
import { LeaveBalanceActions } from "./LeaveBalanceActions"
import { DataTable } from "@/components/ui/data-table"

interface LeaveBalancesTableEnhancedProps {
  balances: any[]
}

export function LeaveBalancesTableEnhanced({ balances }: LeaveBalancesTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all")

  const getLeaveTypeName = (name: string) => {
    const names: Record<string, string> = {
      VACATION: "Vacaciones",
      SICK_LEAVE: "Incapacidad médica",
      PERSONAL: "Personal",
      MATERNITY: "Maternidad",
      PATERNITY: "Paternidad",
      UNPAID: "Sin goce de sueldo",
    }
    return names[name] || name
  }

  // Obtener años únicos
  const uniqueYears = useMemo(() => {
    const years = new Set(balances.map((b) => b.year))
    return Array.from(years).sort((a, b) => b - a)
  }, [balances])

  // Obtener tipos de permiso únicos
  const uniqueLeaveTypes = useMemo(() => {
    const types = new Map()
    balances.forEach((b) => {
      if (!types.has(b.leaveType.id)) {
        types.set(b.leaveType.id, b.leaveType)
      }
    })
    return Array.from(types.values())
  }, [balances])

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
    // Empleado
    {
      accessorKey: "employee.user.firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empleado" />
      ),
      cell: ({ row }) => {
        const balance = row.original
        return (
          <div>
            <p className="font-medium">
              {balance.employee.user.firstName} {balance.employee.user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {balance.employee.employeeCode}
            </p>
          </div>
        )
      },
    },
    // Departamento
    {
      accessorKey: "employee.department.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Departamento" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {row.original.employee.department?.name || "Sin departamento"}
          </span>
        )
      },
    },
    // Tipo de permiso
    {
      accessorKey: "leaveType.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => {
        const balance = row.original
        return (
          <Badge
            variant="outline"
            style={{
              borderColor: balance.leaveType.color,
              color: balance.leaveType.color,
            }}
          >
            {getLeaveTypeName(balance.leaveType.name)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    // Año
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Año" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{row.getValue("year")}</span>
          </div>
        )
      },
    },
    // Total
    {
      accessorKey: "totalDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.getValue("totalDays")} días
          </div>
        )
      },
    },
    // Usados
    {
      accessorKey: "usedDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usados" />
      ),
      cell: ({ row }) => {
        const balance = row.original
        const usagePercentage = balance.totalDays > 0
          ? (balance.usedDays / balance.totalDays) * 100
          : 0
        return (
          <div className="flex flex-col items-end">
            <span className="font-medium text-red-600">
              {balance.usedDays} días
            </span>
            <span className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(0)}%
            </span>
          </div>
        )
      },
    },
    // Pendientes
    {
      accessorKey: "pendingDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pendientes" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right text-yellow-600 font-medium">
            {row.getValue("pendingDays")} días
          </div>
        )
      },
    },
    // Disponibles
    {
      id: "available",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Disponibles" />
      ),
      cell: ({ row }) => {
        const balance = row.original
        const available = balance.totalDays - balance.usedDays - balance.pendingDays
        return (
          <span
            className={`font-medium text-right block ${
              available > 0
                ? "text-green-600"
                : available === 0
                ? "text-muted-foreground"
                : "text-red-600"
            }`}
          >
            {available} días
          </span>
        )
      },
    },
    // Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        return <LeaveBalanceActions balance={row.original} />
      },
    },
  ]

  // Filtrar saldos
  const filteredBalances = useMemo(() => {
    return balances.filter((balance) => {
      const employeeName = `${balance.employee.user.firstName} ${balance.employee.user.lastName}`.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = employeeName.includes(searchLower) ||
        balance.employee.employeeCode.toLowerCase().includes(searchLower)

      const matchesYear =
        yearFilter === "all" || balance.year.toString() === yearFilter
      const matchesType =
        leaveTypeFilter === "all" || balance.leaveType.id === leaveTypeFilter

      return matchesSearch && matchesYear && matchesType
    })
  }, [balances, searchTerm, yearFilter, leaveTypeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setYearFilter("all")
    setLeaveTypeFilter("all")
  }

  const hasActiveFilters = searchTerm || yearFilter !== "all" || leaveTypeFilter !== "all"

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Lista de Saldos de Permisos
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {uniqueLeaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {getLeaveTypeName(type.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {filteredBalances.length} de {balances.length} saldos
            </Badge>
            {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={filteredBalances}
          deleteEndpoint="/api/leave-balances/bulk-delete"
          itemName="saldo de permiso"
        />
      </CardContent>
    </Card>
  )
}
