"use client"

import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"

export interface Material {
  id: string
  type: string
  size: string
  length: number
  price: number
}

interface MaterialTableProps {
  materials: Material[]
  onEdit: (material: Material) => void
  onDelete: (id: string) => void
}

export function MaterialTable({ materials, onEdit, onDelete }: MaterialTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Medida</TableHead>
          <TableHead>Longitud (m)</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No se encontraron materiales
            </TableCell>
          </TableRow>
        ) : (
          materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.type}</TableCell>
              <TableCell>{material.size}</TableCell>
              <TableCell>{material.length}</TableCell>
              <TableCell>{formatCurrency(material.price)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(material)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(material.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
