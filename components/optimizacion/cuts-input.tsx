"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CutsInputProps {
  cuts: string
  onCutsChange: (cuts: string) => void
}

export function CutsInput({ cuts, onCutsChange }: CutsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cuts">Cortes Requeridos (metros, separados por comas)</Label>
      <Input
        id="cuts"
        placeholder="Ej: 1.5, 2.3, 0.8, 1.5, 2.0"
        value={cuts}
        onChange={(e) => onCutsChange(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        Ingrese las longitudes de los cortes que necesita, separadas por comas.
      </p>
    </div>
  )
}
