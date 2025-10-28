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
import { Search, TrendingUp, ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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

interface TardinessAccumulation {
  id: string
  employeeId: string
  month: number
  year: number
  lateArrivalsCount: number
  directTardinessCount: number
  formalTardiesCount: number
  administrativeActs: number
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
}

interface TardinessAccumulationsTableProps {
  accumulations: TardinessAccumulation[]
  month: number
  year: number
}

export function TardinessAccumulationsTable({
  accumulations,
  month,
  year,
}: TardinessAccumulationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "formalTardiesCount", desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState("")

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

  const columns: ColumnDef<TardinessAccumulation>[] = [
    {
      accessorKey: "employee.employeeCode",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
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
      accessorKey: "employee.position.title",
      header: "Puesto",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.employee.position?.title || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "lateArrivalsCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Llegadas Tardías
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
    {
      accessorKey: "directTardinessCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Retardos Directos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("directTardinessCount") as number
        return (
          <div className="text-center font-medium text-orange-600">
            {count}
          </div>
        )
      },
    },
    {
      accessorKey: "formalTardiesCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Retardos Formales
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("formalTardiesCount") as number
        return (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{count}</div>
            <div className="text-xs text-muted-foreground">
              {count >= 5 ? "¡Acta!" : count >= 4 ? `${5 - count} para acta` : ""}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "administrativeActs",
      header: "Actas",
      cell: ({ row }) => {
        const count = row.getValue("administrativeActs") as number
        if (count === 0) {
          return <span className="text-muted-foreground text-center block">-</span>
        }
        return (
          <div className="text-center">
            <Badge variant="destructive" className="font-bold">
              {count}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "riskLevel",
      header: "Nivel de Riesgo",
      cell: ({ row }) => {
        return getRiskBadge(row.original.formalTardiesCount)
      },
    },
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

  const table = useReactTable({
    data: accumulations,
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
        pageSize: 15,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código, departamento..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-10 max-w-md"
          />
        </div>
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
                  className={
                    row.original.formalTardiesCount >= 4
                      ? "bg-red-50/50"
                      : row.original.formalTardiesCount >= 3
                      ? "bg-orange-50/50"
                      : ""
                  }
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
                  No hay acumulaciones para este período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getFilteredRowModel().rows.length} de {accumulations.length} empleados
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
          <div className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
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
