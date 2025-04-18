"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Material } from "@/components/materiales/material-table"

interface ImportMaterialsProps {
  onImport: (materials: Material[]) => void
  onCancel: () => void
}

export function ImportMaterials({ onImport, onCancel }: ImportMaterialsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<Material[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setErrors([])
    setParsedData([])
    setIsValid(false)
  }

  const validateAndParse = () => {
    if (!file) {
      setErrors(["Por favor, seleccione un archivo"])
      return
    }

    setIsValidating(true)
    setErrors([])

    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      try {
        const csvData = event.target?.result as string
        const lines = csvData.split("\n")
        const headers = lines[0].split(",").map((header) => header.trim())

        // Validar encabezados
        const requiredHeaders = ["type", "size", "length", "price"]
        const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))

        if (missingHeaders.length > 0) {
          setErrors([
            `Faltan encabezados requeridos: ${missingHeaders.join(", ")}. Los encabezados deben ser: type, size, length, price`,
          ])
          setIsValidating(false)
          return
        }

        const validationErrors: string[] = []
        const parsedMaterials: Material[] = []

        // Procesar cada línea
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue // Saltar líneas vacías

          const values = line.split(",").map((value) => value.trim())

          // Validar que la línea tenga la cantidad correcta de valores
          if (values.length !== headers.length) {
            validationErrors.push(`Línea ${i}: Número incorrecto de valores`)
            continue
          }

          // Crear objeto con los valores
          const materialData: any = {}
          headers.forEach((header, index) => {
            materialData[header] = values[index]
          })

          // Validar campos requeridos
          const lineErrors: string[] = []
          if (!materialData.type) lineErrors.push("Tipo es requerido")
          if (!materialData.size) lineErrors.push("Medida es requerida")

          // Validar campos numéricos
          const length = Number.parseFloat(materialData.length)
          const price = Number.parseFloat(materialData.price)

          if (isNaN(length) || length <= 0) lineErrors.push("Longitud debe ser un número positivo")
          if (isNaN(price) || price <= 0) lineErrors.push("Precio debe ser un número positivo")

          if (lineErrors.length > 0) {
            validationErrors.push(`Línea ${i}: ${lineErrors.join(", ")}`)
            continue
          }

          // Agregar material validado
          parsedMaterials.push({
            id: Date.now().toString() + i, // Generar ID único
            type: materialData.type,
            size: materialData.size,
            length: length,
            price: price,
          })
        }

        if (validationErrors.length > 0) {
          setErrors(validationErrors)
          setIsValid(false)
        } else if (parsedMaterials.length === 0) {
          setErrors(["No se encontraron materiales válidos en el archivo"])
          setIsValid(false)
        } else {
          setParsedData(parsedMaterials)
          setIsValid(true)
        }
      } catch (error) {
        setErrors(["Error al procesar el archivo. Asegúrese de que sea un CSV válido."])
        setIsValid(false)
      }

      setIsValidating(false)
    }

    fileReader.onerror = () => {
      setErrors(["Error al leer el archivo"])
      setIsValidating(false)
      setIsValid(false)
    }

    fileReader.readAsText(file)
  }

  const handleImport = () => {
    if (parsedData.length > 0) {
      onImport(parsedData)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importar Materiales</CardTitle>
        <CardDescription>
          Importe múltiples materiales desde un archivo CSV. El archivo debe tener los siguientes encabezados: type,
          size, length, price
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Archivo CSV</Label>
          <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">
            Formato esperado: type,size,length,price
            <br />
            Ejemplo: Hierro Redondo Liso,6mm,12,2500
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={validateAndParse} disabled={!file || isValidating} variant="outline">
            {isValidating ? "Validando..." : "Validar Archivo"}
          </Button>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de validación</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Vista previa ({parsedData.length} materiales)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>Longitud (m)</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.slice(0, 5).map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.type}</TableCell>
                    <TableCell>{material.size}</TableCell>
                    <TableCell>{material.length}</TableCell>
                    <TableCell>{formatCurrency(material.price)}</TableCell>
                  </TableRow>
                ))}
                {parsedData.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      ... y {parsedData.length - 5} más
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button onClick={handleImport} disabled={!isValid || parsedData.length === 0}>
          <Check className="mr-2 h-4 w-4" />
          Importar {parsedData.length} Materiales
        </Button>
      </CardFooter>
    </Card>
  )
}
