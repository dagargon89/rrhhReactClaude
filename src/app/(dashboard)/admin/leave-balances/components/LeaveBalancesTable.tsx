"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Wallet, X, Button } from "lucide-react"
import { LeaveBalanceActions } from "./LeaveBalanceActions"

interface LeaveBalancesTableProps {
  balances: any[]
}

export function LeaveBalancesTable({ balances }: LeaveBalancesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all")

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

  const filteredBalances = useMemo(() => {
    return balances.filter((balance) => {
      const employeeName = `${balance.employee.user.firstName} ${balance.employee.user.lastName}`.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = employeeName.includes(searchLower)

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

  const hasActiveFilters =
    searchTerm || yearFilter !== "all" || leaveTypeFilter !== "all"

  const getLeaveTypeName = (name: string) => {
    switch (name) {
      case "VACATION":
        return "Vacaciones"
      case "SICK_LEAVE":
        return "Incapacidad médica"
      case "PERSONAL":
        return "Personal"
      case "MATERNITY":
        return "Maternidad"
      case "PATERNITY":
        return "Paternidad"
      case "UNPAID":
        return "Sin goce de sueldo"
      default:
        return name
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Lista de Saldos
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

          {/* Barra de búsqueda y filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Año */}
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

            {/* Filtro de Tipo de Permiso */}
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

          {/* Indicador de resultados */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {filteredBalances.length} de {balances.length} saldos
            </Badge>
            {hasActiveFilters && <span className="text-xs">Filtros aplicados</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Tipo de Permiso</TableHead>
              <TableHead>Año</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Usados</TableHead>
              <TableHead className="text-right">Pendientes</TableHead>
              <TableHead className="text-right">Disponibles</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBalances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {hasActiveFilters
                        ? "No se encontraron saldos con los filtros aplicados"
                        : "No hay saldos registrados"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBalances.map((balance) => {
                const available =
                  balance.totalDays - balance.usedDays - balance.pendingDays
                const usagePercentage =
                  balance.totalDays > 0
                    ? (balance.usedDays / balance.totalDays) * 100
                    : 0

                return (
                  <TableRow key={balance.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {balance.employee.user.firstName}{" "}
                          {balance.employee.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {balance.employee.employeeCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {balance.employee.department?.name || "Sin departamento"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: balance.leaveType.color,
                          color: balance.leaveType.color,
                        }}
                      >
                        {getLeaveTypeName(balance.leaveType.name)}
                      </Badge>
                    </TableCell>
                    <TableCell>{balance.year}</TableCell>
                    <TableCell className="text-right font-medium">
                      {balance.totalDays} días
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-red-600">
                          {balance.usedDays} días
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {usagePercentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-yellow-600 font-medium">
                      {balance.pendingDays} días
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          available > 0
                            ? "text-green-600"
                            : available === 0
                            ? "text-muted-foreground"
                            : "text-red-600"
                        }`}
                      >
                        {available} días
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <LeaveBalanceActions balance={balance} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
