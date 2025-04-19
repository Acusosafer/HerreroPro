"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { FileDown, Plus } from "lucide-react"

interface OptimizationResultProps {
  result: {
    solution: number[][]
    waste: number
    wastePercentage: number
    barsNeeded: number
  }
  stockLength: number
  kerf: number // kerf en milímetros
  materialPrice: number
  onAddToCart: () => void
  onBack: () => void
}

export function OptimizationResult({
  result,
  stockLength,
  kerf,
  materialPrice,
  onAddToCart,
  onBack,
}: OptimizationResultProps) {
  // Usar directamente el número de barras calculado
  const totalBars = result.barsNeeded
  const totalCost = totalBars * materialPrice

  // Convertir kerf de milímetros a metros para los cálculos
  const kerfMeters = kerf / 1000

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium">Barras Necesarias</p>
          <p className="text-2xl font-bold">{totalBars}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium">Desperdicio Total</p>
          <p className="text-2xl font-bold">
            {result.waste.toFixed(2)} m ({result.wastePercentage.toFixed(2)}%)
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium">Costo Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Distribución de Cortes</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span>Cortes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-destructive/30 rounded"></div>
              <span>Desperdicio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Corte ({kerf} mm)</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {result.solution.map((bar: number[], index: number) => {
            // Calcular el desperdicio para esta barra
            const totalCutLength = bar.reduce((sum: number, cut: number) => sum + cut, 0)
            const totalKerfLength = bar.length > 1 ? (bar.length - 1) * kerfMeters : 0
            const wasteLength = stockLength - totalCutLength - totalKerfLength
            const wastePercentage = (wasteLength / stockLength) * 100

            return (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-lg">Barra {index + 1}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Longitud total: {stockLength} m</span>
                    <span className="text-sm text-muted-foreground">
                      Desperdicio: {wasteLength.toFixed(2)} m ({wastePercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Visualización de la barra */}
                <div className="relative w-full h-16 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <div className="absolute top-0 left-0 h-full w-full flex">
                    {bar.map((cut: number, cutIndex: number) => {
                      // Calcular posición y ancho
                      let position = 0
                      for (let i = 0; i < cutIndex; i++) {
                        position += (bar[i] / stockLength) * 100 + (kerfMeters / stockLength) * 100
                      }

                      const cutPercentage = (cut / stockLength) * 100
                      const kerfPercentage = (kerfMeters / stockLength) * 100

                      return (
                        <div
                          key={cutIndex}
                          className="h-full flex"
                          style={{ marginLeft: cutIndex > 0 ? 0 : `${position}%` }}
                        >
                          <div
                            className="h-full bg-primary flex flex-col items-center justify-center text-xs text-white relative"
                            style={{ width: `${cutPercentage}%` }}
                          >
                            <span className="font-bold">{cut} m</span>
                            <span className="text-[10px]">Corte {cutIndex + 1}</span>
                            <div className="absolute -bottom-5 left-0 w-full text-center text-black text-[10px]">
                              {((cut / stockLength) * 100).toFixed(1)}%
                            </div>
                          </div>
                          {cutIndex < bar.length - 1 && (
                            <div
                              className="h-full bg-gray-300 flex items-center justify-center text-[8px] text-gray-700"
                              style={{ width: `${kerfPercentage}%` }}
                            >
                              {kerf} mm
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Desperdicio */}
                    <div
                      className="h-full bg-destructive/30 flex items-center justify-center text-xs"
                      style={{
                        width: `${wastePercentage}%`,
                        marginLeft: bar.length > 0 ? `${((totalCutLength + totalKerfLength) / stockLength) * 100}%` : 0,
                      }}
                    >
                      {wasteLength > 0.1 ? `${wasteLength.toFixed(2)} m` : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-1">Detalle de cortes:</h5>
                    <ul className="list-disc list-inside text-sm">
                      {bar.map((cut: number, cutIndex: number) => (
                        <li key={cutIndex}>
                          Corte {cutIndex + 1}: {cut} m
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-1">Resumen:</h5>
                    <ul className="list-none text-sm space-y-1">
                      <li>Total cortes: {bar.length}</li>
                      <li>Longitud utilizada: {totalCutLength.toFixed(2)} m</li>
                      <li>
                        Kerf (cortes): {totalKerfLength.toFixed(3)} m ({bar.length > 1 ? bar.length - 1 : 0} cortes de{" "}
                        {kerf} mm)
                      </li>
                      <li>Desperdicio: {wasteLength.toFixed(2)} m</li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Explicación del Algoritmo</h3>
        <p className="text-sm">
          El algoritmo calcula el número de barras necesarias dividiendo la longitud total requerida (incluyendo el
          espacio de corte) entre la longitud de cada barra. Luego distribuye los cortes de manera eficiente para
          minimizar el desperdicio.
        </p>
        <div className="mt-2 text-sm">
          <p className="font-medium">Cálculos realizados:</p>
          <ol className="list-decimal list-inside mt-1">
            <li>Longitud total de cortes: suma de todos los cortes solicitados</li>
            <li>Espacio de corte (kerf): {kerf} mm por cada corte (excepto el último)</li>
            <li>Barras necesarias: longitud total ÷ longitud de barra (redondeado hacia arriba)</li>
            <li>Desperdicio: material sobrante en cada barra</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver a Editar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={onAddToCart}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </div>
  )
}
