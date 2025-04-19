"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { formatCurrency } from "@/lib/utils"
import type { Material } from "@/components/materiales/material-table"

interface MaterialSelectorProps {
  materials: Material[]
  onMaterialChange: (materialId: string) => void
  onStockLengthChange: (length: number) => void
  onKerfChange: (kerf: number) => void
  stockLength: number
  kerf: number
  selectedMaterialId: string
}

export function MaterialSelector({
  materials,
  onMaterialChange,
  onStockLengthChange,
  onKerfChange,
  stockLength,
  kerf,
  selectedMaterialId,
}: MaterialSelectorProps) {
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [selectedType, setSelectedType] = useState<string>("")

  // Extraer tipos únicos de materiales
  useEffect(() => {
    if (materials.length > 0) {
      const types = Array.from(new Set(materials.map((material) => material.type)))
      setUniqueTypes(types)

      // Establecer el tipo inicial si no hay uno seleccionado
      if (!selectedType && types.length > 0) {
        setSelectedType(types[0])
      }
    }
  }, [materials, selectedType])

  // Filtrar materiales por tipo seleccionado
  useEffect(() => {
    if (selectedType) {
      const filtered = materials.filter((material) => material.type === selectedType)
      setFilteredMaterials(filtered)

      // Seleccionar el primer material del tipo si no hay uno seleccionado
      if (filtered.length > 0 && (!selectedMaterialId || !filtered.some((m) => m.id === selectedMaterialId))) {
        onMaterialChange(filtered[0].id)
        onStockLengthChange(filtered[0].length)
      }
    }
  }, [selectedType, materials, selectedMaterialId, onMaterialChange, onStockLengthChange])

  // Manejar cambio de tipo
  const handleTypeChange = (value: string) => {
    setSelectedType(value)
  }

  // Manejar cambio de material
  const handleMaterialChange = (value: string) => {
    onMaterialChange(value)

    // Actualizar longitud de stock
    const selectedMaterial = materials.find((m) => m.id === value)
    if (selectedMaterial) {
      onStockLengthChange(selectedMaterial.length)
    }
  }

  // Obtener el material seleccionado
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="material-type">Tipo de Material</Label>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger id="material-type">
            <SelectValue placeholder="Seleccione el tipo de material" />
          </SelectTrigger>
          <SelectContent>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-size">Medida</Label>
        <Select
          value={selectedMaterialId}
          onValueChange={handleMaterialChange}
          disabled={filteredMaterials.length === 0}
        >
          <SelectTrigger id="material-size">
            <SelectValue placeholder="Seleccione la medida" />
          </SelectTrigger>
          <SelectContent>
            {filteredMaterials.map((material) => (
              <SelectItem key={material.id} value={material.id}>
                {material.size} - {formatCurrency(material.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock-length">Longitud de la Barra (metros)</Label>
        <Input
          id="stock-length"
          type="number"
          value={stockLength}
          min={1}
          step={0.1}
          onChange={(e) => onStockLengthChange(Number.parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kerf">Espesor de Corte (milímetros)</Label>
        <div className="flex items-center space-x-4">
          <Slider
            id="kerf"
            min={1}
            max={10}
            step={0.5}
            value={[kerf]}
            onValueChange={(value) => onKerfChange(value[0])}
          />
          <span className="w-12 text-center">{kerf} mm</span>
        </div>
      </div>
    </div>
  )
}
