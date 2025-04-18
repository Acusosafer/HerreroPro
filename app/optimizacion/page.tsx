"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { optimizeCuts, getMaterials } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { v4 as uuidv4 } from "uuid"
import { MaterialSelector } from "@/components/optimizacion/material-selector"
import { CutsInput } from "@/components/optimizacion/cuts-input"
import { OptimizationResult } from "@/components/optimizacion/optimization-result"
import type { Material } from "@/components/materiales/material-table"

// Datos de ejemplo para materiales (se usarán si no hay materiales en localStorage)
const initialMaterials = [
  { id: "1", type: "Hierro Redondo Liso", size: "6mm", length: 12, price: 2500 },
  { id: "2", type: "Hierro Redondo Liso", size: "8mm", length: 12, price: 3200 },
  { id: "3", type: "Hierro Redondo Liso", size: "10mm", length: 12, price: 4800 },
  { id: "4", type: "Hierro Redondo Liso", size: "12mm", length: 12, price: 6500 },
  { id: "5", type: "Hierro Redondo Nervado", size: "6mm", length: 12, price: 2800 },
  { id: "6", type: "Hierro Redondo Nervado", size: "8mm", length: 12, price: 3600 },
  { id: "7", type: "Hierro Redondo Nervado", size: "10mm", length: 12, price: 5200 },
  { id: "8", type: "Hierro Redondo Nervado", size: "12mm", length: 12, price: 7000 },
  { id: "9", type: "Hierro Cuadrado", size: "12mm", length: 12, price: 3500 },
  { id: "10", type: "Hierro Cuadrado", size: "16mm", length: 12, price: 4800 },
  { id: "11", type: "Hierro Cuadrado", size: "20mm", length: 12, price: 6200 },
  { id: "12", type: "Hierro Planchuela", size: '1 1/4"', length: 6, price: 3800 },
  { id: "13", type: "Hierro Planchuela", size: '1 1/2"', length: 6, price: 4500 },
  { id: "14", type: "Hierro Planchuela", size: '2"', length: 6, price: 5800 },
  { id: "15", type: "Hierro Ángulo", size: '1"', length: 6, price: 4200 },
  { id: "16", type: "Hierro Ángulo", size: '1 1/4"', length: 6, price: 5100 },
  { id: "17", type: "Hierro Ángulo", size: '1 1/2"', length: 6, price: 6300 },
]

export default function OptimizacionPage() {
  const { addItem } = useCart()
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [stockLength, setStockLength] = useState<number>(12)
  const [kerf, setKerf] = useState<number>(3) // Valor predeterminado en milímetros
  const [cuts, setCuts] = useState<string>("")
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("input")

  // Cargar materiales al iniciar
  useEffect(() => {
    const storedMaterials = getMaterials()
    const materialsToUse = storedMaterials.length > 0 ? storedMaterials : initialMaterials
    setMaterials(materialsToUse)

    // Seleccionar el primer material por defecto
    if (materialsToUse.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materialsToUse[0].id)
      setStockLength(materialsToUse[0].length)
    }
  }, [selectedMaterialId])

  const handleOptimize = () => {
    const cutLengths = cuts
      .split(",")
      .map((cut) => Number.parseFloat(cut.trim()))
      .filter((cut) => !isNaN(cut) && cut > 0)

    if (cutLengths.length === 0) {
      alert("Por favor, ingrese al menos un corte válido")
      return
    }

    // Pasar el kerf en milímetros a la función optimizeCuts
    const result = optimizeCuts(stockLength, cutLengths, kerf)
    setOptimizationResult(result)
    setActiveTab("result")
  }

  const handleAddToCart = () => {
    if (!optimizationResult) return

    const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
    if (!selectedMaterial) return

    const barsNeeded = optimizationResult.barsNeeded

    addItem({
      id: uuidv4(),
      name: `${selectedMaterial.type} ${selectedMaterial.size}`,
      price: selectedMaterial.price,
      quantity: barsNeeded,
      type: "material",
      length: stockLength,
    })

    alert(`Se han agregado ${barsNeeded} barras de ${selectedMaterial.type} ${selectedMaterial.size} al carrito`)
  }

  const getMaterialPrice = () => {
    const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
    return selectedMaterial ? selectedMaterial.price : 0
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Optimización de Cortes</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Datos de Entrada</TabsTrigger>
            <TabsTrigger value="result" disabled={!optimizationResult}>
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Material</CardTitle>
                <CardDescription>Seleccione el tipo de material y configure sus especificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MaterialSelector
                  materials={materials}
                  onMaterialChange={setSelectedMaterialId}
                  onStockLengthChange={setStockLength}
                  onKerfChange={setKerf}
                  stockLength={stockLength}
                  kerf={kerf}
                  selectedMaterialId={selectedMaterialId}
                />

                <CutsInput cuts={cuts} onCutsChange={setCuts} />
              </CardContent>
              <CardFooter>
                <Button onClick={handleOptimize}>Optimizar Cortes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            {optimizationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado de la Optimización</CardTitle>
                  <CardDescription>Plan óptimo de cortes para minimizar el desperdicio</CardDescription>
                </CardHeader>
                <CardContent>
                  <OptimizationResult
                    result={optimizationResult}
                    stockLength={stockLength}
                    kerf={kerf}
                    materialPrice={getMaterialPrice()}
                    onAddToCart={handleAddToCart}
                    onBack={() => setActiveTab("input")}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
