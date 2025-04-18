"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, FileUp } from "lucide-react"
import { MaterialForm, type MaterialFormData } from "@/components/materiales/material-form"
import { MaterialTable, type Material } from "@/components/materiales/material-table"
import { MaterialFilters } from "@/components/materiales/material-filters"
import { ImportMaterials } from "@/components/materiales/import-materials"
import { getMaterials, saveMaterials } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para materiales
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

export default function MaterialesPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("list")

  // Cargar materiales al iniciar
  useEffect(() => {
    const storedMaterials = getMaterials()
    setMaterials(storedMaterials.length > 0 ? storedMaterials : initialMaterials)
  }, [])

  // Guardar materiales cuando cambien
  useEffect(() => {
    if (materials.length > 0) {
      saveMaterials(materials)
    }
  }, [materials])

  // Extraer tipos únicos de materiales para el filtro
  useEffect(() => {
    const types = Array.from(new Set(materials.map((material) => material.type)))
    setUniqueTypes(types)
  }, [materials])

  const handleAddMaterial = () => {
    setEditingMaterial(null)
    setIsDialogOpen(true)
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setIsDialogOpen(true)
  }

  const handleDeleteMaterial = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este material?")) {
      const updatedMaterials = materials.filter((material) => material.id !== id)
      setMaterials(updatedMaterials)
    }
  }

  const handleSaveMaterial = (formData: MaterialFormData) => {
    let updatedMaterials: Material[]

    if (editingMaterial) {
      // Actualizar material existente
      updatedMaterials = materials.map((material) => (material.id === formData.id ? formData : material))
    } else {
      // Agregar nuevo material
      updatedMaterials = [...materials, formData]
    }

    setMaterials(updatedMaterials)
    setIsDialogOpen(false)
  }

  const handleImportMaterials = (importedMaterials: Material[]) => {
    // Verificar duplicados por tipo y tamaño
    const newMaterials = importedMaterials.filter((importedMaterial) => {
      return !materials.some(
        (existingMaterial) =>
          existingMaterial.type === importedMaterial.type && existingMaterial.size === importedMaterial.size,
      )
    })

    if (newMaterials.length !== importedMaterials.length) {
      const duplicatesCount = importedMaterials.length - newMaterials.length
      alert(`Se encontraron ${duplicatesCount} materiales duplicados que serán omitidos.`)
    }

    if (newMaterials.length > 0) {
      setMaterials([...materials, ...newMaterials])
      alert(`Se importaron ${newMaterials.length} materiales correctamente.`)
    } else {
      alert("No se importaron materiales. Todos los materiales ya existen en la base de datos.")
    }

    setActiveTab("list")
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.size.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType ? material.type === filterType : true

    return matchesSearch && matchesType
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestión de Materiales</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddMaterial}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Material
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("import")}>
              <FileUp className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Materiales</TabsTrigger>
            <TabsTrigger value="import">Importar Materiales</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Busque y filtre los materiales según sus necesidades</CardDescription>
              </CardHeader>
              <CardContent>
                <MaterialFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterType={filterType}
                  onFilterTypeChange={setFilterType}
                  materialTypes={uniqueTypes}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Materiales</CardTitle>
                <CardDescription>Gestione los materiales, sus precios y especificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <MaterialTable
                  materials={filteredMaterials}
                  onEdit={handleEditMaterial}
                  onDelete={handleDeleteMaterial}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <ImportMaterials onImport={handleImportMaterials} onCancel={() => setActiveTab("list")} />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Editar Material" : "Agregar Material"}</DialogTitle>
              <DialogDescription>
                {editingMaterial ? "Modifique los detalles del material" : "Complete los detalles del nuevo material"}
              </DialogDescription>
            </DialogHeader>
            <MaterialForm
              initialData={editingMaterial || undefined}
              onSave={handleSaveMaterial}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}
