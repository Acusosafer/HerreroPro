"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, FileUp, Loader2 } from "lucide-react"
import { MaterialForm, type MaterialFormData } from "@/components/materiales/material-form"
import { MaterialTable, type Material } from "@/components/materiales/material-table"
import { MaterialFilters } from "@/components/materiales/material-filters"
import { ImportMaterials } from "@/components/materiales/import-materials"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useMaterialsDB } from "@/hooks/use-materials-db"

export default function MaterialesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("list")

  const { materials, loading, saveMaterial, updateMaterial, deleteMaterial, importMaterials } = useMaterialsDB()

  // Extraer tipos únicos de materiales para el filtro
  useEffect(() => {
    if (materials.length > 0) {
      const types = Array.from(new Set(materials.map((material) => material.type)))
      setUniqueTypes(types)
    }
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
      deleteMaterial(id)
    }
  }

  const handleSaveMaterial = (formData: MaterialFormData) => {
    if (editingMaterial) {
      // Actualizar material existente
      updateMaterial({
        ...editingMaterial,
        ...formData,
      })
    } else {
      // Agregar nuevo material
      saveMaterial(formData)
    }

    setIsDialogOpen(false)
  }

  const handleImportMaterials = (importedMaterials: Omit<Material, "id" | "user_email" | "created_at">[]) => {
    importMaterials(importedMaterials)
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
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8 mt-16">
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
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <MaterialTable
                      materials={filteredMaterials}
                      onEdit={handleEditMaterial}
                      onDelete={handleDeleteMaterial}
                    />
                  )}
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
    </ProtectedRoute>
  )
}
