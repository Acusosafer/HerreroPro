"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type MaterialFormData = {
  type: string
  size: string
  length: number
  price: number
}

type MaterialFormProps = {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    id: string
    type: string
    size: string
    length: number
    price: number
  }
  onSave: (data: MaterialFormData) => void
}

export function MaterialForm({ onSuccess, onCancel, initialData, onSave }: MaterialFormProps) {
  const [type, setType] = useState(initialData?.type || "")
  const [size, setSize] = useState(initialData?.size || "")
  const [length, setLength] = useState(initialData?.length || 12)
  const [price, setPrice] = useState(initialData?.price || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = {
        type,
        size,
        length,
        price,
      }

      onSave(formData)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving material:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Material</Label>
        <Select value={type} onValueChange={setType} required>
          <SelectTrigger id="type">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hierro Redondo Liso">Hierro Redondo Liso</SelectItem>
            <SelectItem value="Hierro Redondo Nervado">Hierro Redondo Nervado</SelectItem>
            <SelectItem value="Hierro Cuadrado">Hierro Cuadrado</SelectItem>
            <SelectItem value="Hierro Planchuela">Hierro Planchuela</SelectItem>
            <SelectItem value="Hierro Ángulo">Hierro Ángulo</SelectItem>
            <SelectItem value="Caño Estructural">Caño Estructural</SelectItem>
            <SelectItem value="Caño Redondo">Caño Redondo</SelectItem>
            <SelectItem value="Perfil C">Perfil C</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Medida</Label>
        <Input
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder='Ej: 10mm, 1/2", 20x20'
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="length">Largo (metros)</Label>
        <Input
          id="length"
          type="number"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          min={0.1}
          step={0.1}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Precio</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          min={0}
          step={0.01}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
