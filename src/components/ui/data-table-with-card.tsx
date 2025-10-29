"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface Filter {
  id: string
  label: string
  options: { value: string; label: string }[]
  icon?: React.ReactNode
}

interface DataTableWithCardProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title: string
  icon?: React.ReactNode
  searchPlaceholder?: string
  searchKey?: string
  filters?: Filter[]
  deleteEndpoint?: string
  itemName?: string
  onSearch?: (value: string) => void
  onFilterChange?: (filterId: string, value: string) => void
}

export function DataTableWithCard<TData, TValue>({
  columns,
  data,
  title,
  icon,
  searchPlaceholder = "Buscar...",
  searchKey,
  filters = [],
  deleteEndpoint,
  itemName = "registro",
  onSearch,
  onFilterChange,
}: DataTableWithCardProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})

  const hasActiveFilters = searchTerm || Object.values(filterValues).some(v => v !== "all")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterId]: value }))
    onFilterChange?.(filterId, value)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterValues({})
    filters.forEach(filter => {
      onFilterChange?.(filter.id, "all")
    })
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
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
          {(searchKey || filters.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr,repeat(auto-fit,minmax(200px,1fr))] gap-4">
              {/* Búsqueda */}
              {searchKey && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}

              {/* Filtros dinámicos */}
              {filters.map((filter) => (
                <Select
                  key={filter.id}
                  value={filterValues[filter.id] || "all"}
                  onValueChange={(value) => handleFilterChange(filter.id, value)}
                >
                  <SelectTrigger>
                    {filter.icon}
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}

          {/* Indicador de resultados */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              {data.length} {itemName}{data.length !== 1 ? "s" : ""}
            </Badge>
            {hasActiveFilters && (
              <span className="text-xs">Filtros aplicados</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          searchKey={searchKey}
          deleteEndpoint={deleteEndpoint}
          itemName={itemName}
        />
      </CardContent>
    </Card>
  )
}
