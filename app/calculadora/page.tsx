"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { Plus, Calculator } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// Datos de ejemplo para materiales
const materialTypes = [
  { id: "hierro-redondo-liso", name: "Hierro Redondo Liso", defaultLength: 12 },
  { id: "hierro-redondo-nervado", name: "Hierro Redondo Nervado", defaultLength: 12 },
  { id: "hierro-cuadrado", name: "Hierro Cuadrado", defaultLength: 12 },
  { id: "hierro-planchuela", name: '  name: "Hierro Cuadrado', defaultLength: 12 },
  { id: "hierro-planchuela", name: "Hierro Planchuela", defaultLength: 6 },
  { id: "hierro-angulo", name: "Hierro Ángulo", defaultLength: 6 },
]

const materialSizes = {
  "hierro-redondo-liso": [
    { id: "6mm", name: "6mm", price: 2500, weight: 0.222 },
    { id: "8mm", name: "8mm", price: 3200, weight: 0.395 },
    { id: "10mm", name: "10mm", price: 4800, weight: 0.617 },
    { id: "12mm", name: "12mm", price: 6500, weight: 0.888 },
  ],
  "hierro-redondo-nervado": [
    { id: "6mm", name: "6mm", price: 2800, weight: 0.25 },
    { id: "8mm", name: "8mm", price: 3600, weight: 0.42 },
    { id: "10mm", name: "10mm", price: 5200, weight: 0.65 },
    { id: "12mm", name: "12mm", price: 7000, weight: 0.92 },
  ],
  "hierro-cuadrado": [
    { id: "12mm", name: "12mm", price: 3500, weight: 1.13 },
    { id: "16mm", name: "16mm", price: 4800, weight: 2.01 },
    { id: "20mm", name: "20mm", price: 6200, weight: 3.14 },
  ],
  "hierro-planchuela": [
    { id: "1-1/4", name: '1 1/4"', price: 3800, weight: 1.58 },
    { id: "1-1/2", name: '1 1/2"', price: 4500, weight: 1.89 },
    { id: "2", name: '2"', price: 5800, weight: 2.52 },
  ],
  "hierro-angulo": [
    { id: "1", name: '1"', price: 4200, weight: 1.21 },
    { id: "1-1/4", name: '1 1/4"', price: 5100, weight: 1.51 },
    { id: "1-1/2", name: '1 1/2"', price: 6300, weight: 1.81 },
  ],
}

export default function CalculadoraPage() {
  const { addItem } = useCart()
  const [activeTab, setActiveTab] = useState("peso")
  const [selectedMaterial, setSelectedMaterial] = useState(materialTypes[0].id)
  const [selectedSize, setSelectedSize] = useState(materialSizes[materialTypes[0].id][0].id)
  const [length, setLength] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [totalWeight, setTotalWeight] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value)
    setSelectedSize(materialSizes[value][0].id)
    calculateResults()
  }

  const handleSizeChange = (value: string) => {
    setSelectedSize(value)
    calculateResults()
  }

  const handleLengthChange = (value: number) => {
    setLength(value)
    calculateResults()
  }

  const handleQuantityChange = (value: number) => {
    setQuantity(value)
    calculateResults()
  }

  const calculateResults = () => {
    const sizeInfo = materialSizes[selectedMaterial].find((s) => s.id === selectedSize)

    if (sizeInfo) {
      // Peso en kg por metro
      const weightPerMeter = sizeInfo.weight

      // Peso total
      const weight = weightPerMeter * length * quantity
      setTotalWeight(weight)

      // Precio por barra
      const materialType = materialTypes.find((m) => m.id === selectedMaterial)
      const defaultLength = materialType ? materialType.defaultLength : 12

      // Precio por metro
      const pricePerMeter = sizeInfo.price / defaultLength

      // Precio total
      const price = pricePerMeter * length * quantity
      setTotalPrice(price)
    }
  }

  const handleAddToCart = () => {
    const materialType = materialTypes.find((m) => m.id === selectedMaterial)
    const sizeInfo = materialSizes[selectedMaterial].find((s) => s.id === selectedSize)

    if (!materialType || !sizeInfo) return

    addItem({
      id: uuidv4(),
      name: `${materialType.name} ${sizeInfo.name} (${length}m)`,
      price: totalPrice,
      quantity: quantity,
      type: "material",
      length: length,
    })

    alert("Material agregado al carrito")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Calculadora de Hierro</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="peso">Cálculo de Peso</TabsTrigger>
            <TabsTrigger value="precio">Cálculo de Precio</TabsTrigger>
          </TabsList>

          <TabsContent value="peso">
            <Card>
              <CardHeader>
                <CardTitle>Calculadora de Peso</CardTitle>
                <CardDescription>Calcule el peso total del material según sus especificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material-type">Tipo de Material</Label>
                    <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                      <SelectTrigger id="material-type">
                        <SelectValue placeholder="Seleccione el tipo de material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material-size">Medida</Label>
                    <Select value={selectedSize} onValueChange={handleSizeChange}>
                      <SelectTrigger id="material-size">
                        <SelectValue placeholder="Seleccione la medida" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialSizes[selectedMaterial].map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Longitud (metros)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={length}
                      min={0.1}
                      step={0.1}
                      onChange={(e) => handleLengthChange(Number.parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      min={1}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={calculateResults}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular
                </Button>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Peso por Metro</p>
                      <p className="text-2xl font-bold">
                        {materialSizes[selectedMaterial].find((s) => s.id === selectedSize)?.weight.toFixed(3)} kg/m
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Peso Total</p>
                      <p className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("precio")}>
                  Ver Cálculo de Precio
                </Button>
                <Button onClick={handleAddToCart}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar al Carrito
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="precio">
            <Card>
              <CardHeader>
                <CardTitle>Calculadora de Precio</CardTitle>
                <CardDescription>Calcule el precio total del material según sus especificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material-type-price">Tipo de Material</Label>
                    <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                      <SelectTrigger id="material-type-price">
                        <SelectValue placeholder="Seleccione el tipo de material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material-size-price">Medida</Label>
                    <Select value={selectedSize} onValueChange={handleSizeChange}>
                      <SelectTrigger id="material-size-price">
                        <SelectValue placeholder="Seleccione la medida" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialSizes[selectedMaterial].map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} - {formatCurrency(size.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length-price">Longitud (metros)</Label>
                    <Input
                      id="length-price"
                      type="number"
                      value={length}
                      min={0.1}
                      step={0.1}
                      onChange={(e) => handleLengthChange(Number.parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity-price">Cantidad</Label>
                    <Input
                      id="quantity-price"
                      type="number"
                      value={quantity}
                      min={1}
                      onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={calculateResults}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular
                </Button>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Precio por Metro</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          (materialSizes[selectedMaterial].find((s) => s.id === selectedSize)?.price || 0) /
                            (materialTypes.find((m) => m.id === selectedMaterial)?.defaultLength || 12),
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Precio Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("peso")}>
                  Ver Cálculo de Peso
                </Button>
                <Button onClick={handleAddToCart}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar al Carrito
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
