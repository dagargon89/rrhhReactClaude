"use client"

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DisciplinaryRecordActions } from "./DisciplinaryRecordActions"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DisciplinaryRecord {
  id: string
  employee: {
    employeeCode: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
    department: {
      name: string
    } | null
    position: {
      title: string
    } | null
  }
  actionType: string
  triggerType: string
  triggerCount: number
  description: string
  appliedDate: string
  effectiveDate: string | null
  expirationDate: string | null
  suspensionDays: number | null
  status: string
  approvedBy: {
    firstName: string
    lastName: string
  } | null
  approvedAt: string | null
  notes: string | null
}

interface DisciplinaryRecordsTableProps {
  records: DisciplinaryRecord[]
}

export function DisciplinaryRecordsTable({ records }: DisciplinaryRecordsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "appliedDate", desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PENDING: { variant: "outline", label: "Pendiente" },
      ACTIVE: { variant: "destructive", label: "Activa" },
      COMPLETED: { variant: "secondary", label: "Completada" },
      CANCELLED: { variant: "outline", label: "Cancelada" },
    }
    const config = variants[status] || { variant: "default", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getActionTypeBadge = (actionType: string) => {
    const variants: Record<string, { color: string, label: string }> = {
      ADMINISTRATIVE_ACT: { color: "bg-orange-100 text-orange-800 border-orange-300", label: "Acta Admin." },
      SUSPENSION: { color: "bg-purple-100 text-purple-800 border-purple-300", label: "Suspensión" },
      TERMINATION: { color: "bg-red-100 text-red-800 border-red-300", label: "Rescisión" },
      WARNING: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Advertencia" },
    }
    const config = variants[actionType] || { color: "bg-gray-100 text-gray-800", label: actionType }
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<DisciplinaryRecord>[] = [
    {
      accessorKey: "employee.employeeCode",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.employee.employeeCode}
        </div>
      ),
    },
    {
      accessorKey: "employee.user.firstName",
      header: "Empleado",
      cell: ({ row }) => {
        const { firstName, lastName, email } = row.original.employee.user
        return (
          <div>
            <div className="font-medium">{firstName} {lastName}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "employee.department.name",
      header: "Departamento",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.employee.department?.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "actionType",
      header: "Tipo de Acción",
      cell: ({ row }) => getActionTypeBadge(row.getValue("actionType")),
      filterFn: (row, id, value) => {
        if (value === "all") return true
        return row.getValue(id) === value
      },
    },
    {
      accessorKey: "triggerType",
      header: "Causa",
      cell: ({ row }) => {
        const triggerType = row.getValue("triggerType") as string
        const triggerCount = row.original.triggerCount
        const labels: Record<string, string> = {
          FORMAL_TARDIES: "Retardos formales",
          ADMINISTRATIVE_ACTS: "Actas administrativas",
          UNJUSTIFIED_ABSENCES: "Faltas injustificadas",
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{labels[triggerType] || triggerType}</div>
            <div className="text-xs text-muted-foreground">
              Cantidad: {triggerCount}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "appliedDate",
      header: "Fecha Aplicación",
      cell: ({ row }) => {
        const date = new Date(row.getValue("appliedDate"))
        return (
          <div className="text-sm">
            {date.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "suspensionDays",
      header: "Días Susp.",
      cell: ({ row }) => {
        const days = row.getValue("suspensionDays") as number | null
        if (!days) return <span className="text-muted-foreground">-</span>
        return (
          <div className="text-center font-medium text-red-600">
            {days} {days === 1 ? "día" : "días"}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: (row, id, value) => {
        if (value === "all") return true
        return row.getValue(id) === value
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const record = row.original
        return <DisciplinaryRecordActions record={record} />
      },
    },
  ]

  // Apply filters
  const filteredData = records.filter((record) => {
    if (statusFilter !== "all" && record.status !== statusFilter) return false
    if (actionTypeFilter !== "all" && record.actionType !== actionTypeFilter) return false
    return true
  })

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-10 max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="ACTIVE">Activa</SelectItem>
            <SelectItem value="COMPLETED">Completada</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="ADMINISTRATIVE_ACT">Acta Admin.</SelectItem>
            <SelectItem value="SUSPENSION">Suspensión</SelectItem>
            <SelectItem value="TERMINATION">Rescisión</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getFilteredRowModel().rows.length} de {records.length} registros
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
