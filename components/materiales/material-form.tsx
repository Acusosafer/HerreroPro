"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

export interface MaterialFormData {
  id: string
  type: string
  size: string
  length: number
  price: number
}

interface MaterialFormProps {
  initialData?: MaterialFormData
  onSave: (data: MaterialFormData) => void
  onCancel: () => void
}

export function MaterialForm({ initialData, onSave, onCancel }: MaterialFormProps) {
  const [formData, setFormData] = useState<MaterialFormData>(
    initialData || {
      id: Date.now().toString(),
      type: "",
      size: "",
      length: 12,
      price: 0,
    },
  )

  const handleChange = (field: keyof MaterialFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.size || formData.price <= 0) {
      alert("Por favor, complete todos los campos correctamente")
      return
    }

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="material-type">Tipo de Material</Label>
        <Input
          id="material-type"
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
          placeholder="Ej: Hierro Redondo Liso, Hierro Ángulo, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-size">Medida</Label>
        <Input
          id="material-size"
          value={formData.size}
          onChange={(e) => handleChange("size", e.target.value)}
          placeholder='Ej: 6mm, 12mm, 1 1/4", etc.'
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-length">Longitud (metros)</Label>
        <Input
          id="material-length"
          type="number"
          value={formData.length}
          onChange={(e) => handleChange("length", Number.parseFloat(e.target.value))}
          min={0.1}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-price">Precio</Label>
        <Input
          id="material-price"
          type="number"
          value={formData.price}
          onChange={(e) => handleChange("price", Number.parseFloat(e.target.value))}
          min={0}
          step={100}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Guardar
        </Button>
      </div>
    </form>
  )
}
