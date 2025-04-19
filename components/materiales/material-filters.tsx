"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MaterialFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterType: string
  onFilterTypeChange: (value: string) => void
  materialTypes: string[]
}

export function MaterialFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  materialTypes,
}: MaterialFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Buscar por tipo o medida..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filter-type">Filtrar por Tipo</Label>
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger id="filter-type">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {materialTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
