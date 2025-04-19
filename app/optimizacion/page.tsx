"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { optimizeCuts } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { v4 as uuidv4 } from "uuid"
import { MaterialSelector } from "@/components/optimizacion/material-selector"
import { CutsInput } from "@/components/optimizacion/cuts-input"
import { OptimizationResult } from "@/components/optimizacion/optimization-result"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useMaterialsDB } from "@/hooks/use-materials-db"
import { useCortesDB } from "@/hooks/use-cortes-db"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function OptimizacionPage() {
  const { addItem } = useCart()
  const { materials, loading: loadingMaterials } = useMaterialsDB()
  const { saveCorte } = useCortesDB()

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [stockLength, setStockLength] = useState<number>(12)
  const [kerf, setKerf] = useState<number>(3) // Valor predeterminado en milímetros
  const [cuts, setCuts] = useState<string>("")
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("input")
  const [isSaving, setIsSaving] = useState(false)

  // Seleccionar el primer material por defecto cuando se cargan
  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(materials[0].id)
      setStockLength(materials[0].length)
    }
  }, [materials, selectedMaterialId])

  const handleOptimize = () => {
    const cutLengths = cuts
      .split(",")
      .map((cut) => Number.parseFloat(cut.trim()))
      .filter((cut) => !isNaN(cut) && cut > 0)

    if (cutLengths.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, ingrese al menos un corte válido",
        variant: "destructive",
      })
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

    toast({
      title: "Agregado al carrito",
      description: `Se han agregado ${barsNeeded} barras de ${selectedMaterial.type} ${selectedMaterial.size} al carrito`,
    })
  }

  const handleSaveOptimization = async () => {
    if (!optimizationResult || !selectedMaterialId) return

    setIsSaving(true)

    try {
      // Obtener los cortes como array de números
      const cutLengths = cuts
        .split(",")
        .map((cut) => Number.parseFloat(cut.trim()))
        .filter((cut) => !isNaN(cut) && cut > 0)

      // Guardar la optimización
      await saveCorte({
        material_id: selectedMaterialId,
        stock_length: stockLength,
        kerf: kerf,
        cuts: cutLengths,
        solution: optimizationResult.solution,
        waste: optimizationResult.waste,
        waste_percentage: optimizationResult.wastePercentage,
        bars_needed: optimizationResult.barsNeeded,
      })
    } catch (error) {
      console.error("Error al guardar la optimización:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la optimización",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getMaterialPrice = () => {
    const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
    return selectedMaterial ? selectedMaterial.price : 0
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8 mt-16">
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
                  {loadingMaterials ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleOptimize} disabled={loadingMaterials || !selectedMaterialId || !cuts}>
                    Optimizar Cortes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="result">
              {optimizationResult && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Resultado de la Optimización</CardTitle>
                        <CardDescription>Plan óptimo de cortes para minimizar el desperdicio</CardDescription>
                      </div>
                      <Button variant="outline" onClick={handleSaveOptimization} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Optimización
                          </>
                        )}
                      </Button>
                    </div>
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
    </ProtectedRoute>
  )
}
