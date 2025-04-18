"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, getMaterials } from "@/lib/utils"
import { FileDown, Trash2, Eye, Send, Plus, Calculator, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid"
import type { Material } from "@/components/materiales/material-table"

// Tipos para presupuestos
interface BudgetItem {
  id: string
  materialId: string
  quantity: number
  name: string
  price: number
}

interface StatusChange {
  id: string
  date: string
  oldStatus: string
  newStatus: string
  user: string
}

interface Budget {
  id: string
  name: string
  client: string
  date: string
  total: number
  status: string
  items: BudgetItem[]
  laborCost: number
  notes: string
  statusHistory?: StatusChange[]
}

// Estados disponibles para presupuestos
const budgetStatuses = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "in_progress", label: "En proceso" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
]

// Datos de ejemplo para presupuestos
const initialBudgets: Budget[] = [
  {
    id: "1",
    name: "Proyecto Rejas Casa Familia Rodríguez",
    client: "Juan Rodríguez",
    date: "2023-05-15",
    total: 125000,
    status: "pending",
    items: [
      { id: "1-1", materialId: "4", quantity: 5, name: "Hierro Redondo Liso 12mm", price: 6500 },
      { id: "1-2", materialId: "15", quantity: 8, name: 'Hierro Ángulo 1"', price: 4200 },
      { id: "1-3", materialId: "13", quantity: 10, name: 'Hierro Planchuela 1 1/2"', price: 4500 },
    ],
    laborCost: 45000,
    notes: "Incluye instalación básica",
    statusHistory: [
      {
        id: "sh-1",
        date: "2023-05-15T10:00:00",
        oldStatus: "",
        newStatus: "pending",
        user: "Admin",
      },
    ],
  },
  {
    id: "2",
    name: "Estructura Metálica Galpón Comercial",
    client: "Constructora ABC",
    date: "2023-06-22",
    total: 450000,
    status: "approved",
    items: [
      { id: "2-1", materialId: "8", quantity: 15, name: "Hierro Redondo Nervado 12mm", price: 7000 },
      { id: "2-2", materialId: "11", quantity: 20, name: "Hierro Cuadrado 20mm", price: 6200 },
    ],
    laborCost: 120000,
    notes: "Incluye transporte al sitio",
    statusHistory: [
      {
        id: "sh-2-1",
        date: "2023-06-22T14:30:00",
        oldStatus: "",
        newStatus: "pending",
        user: "Admin",
      },
      {
        id: "sh-2-2",
        date: "2023-06-25T09:15:00",
        oldStatus: "pending",
        newStatus: "approved",
        user: "Admin",
      },
    ],
  },
  {
    id: "3",
    name: "Barandas Escalera Edificio Central",
    client: "Consorcio Edificio Central",
    date: "2023-07-10",
    total: 85000,
    status: "completed",
    items: [{ id: "3-1", materialId: "16", quantity: 12, name: 'Hierro Ángulo 1 1/4"', price: 5100 }],
    laborCost: 25000,
    notes: "",
    statusHistory: [
      {
        id: "sh-3-1",
        date: "2023-07-10T11:20:00",
        oldStatus: "",
        newStatus: "pending",
        user: "Admin",
      },
      {
        id: "sh-3-2",
        date: "2023-07-15T16:45:00",
        oldStatus: "pending",
        newStatus: "in_progress",
        user: "Admin",
      },
      {
        id: "sh-3-3",
        date: "2023-07-30T10:30:00",
        oldStatus: "in_progress",
        newStatus: "completed",
        user: "Admin",
      },
    ],
  },
  {
    id: "4",
    name: "Portón Automático Residencia Martínez",
    client: "Carlos Martínez",
    date: "2023-08-05",
    total: 175000,
    status: "in_progress",
    items: [
      { id: "4-1", materialId: "14", quantity: 6, name: 'Hierro Planchuela 2"', price: 5800 },
      { id: "4-2", materialId: "10", quantity: 4, name: "Hierro Cuadrado 16mm", price: 4800 },
    ],
    laborCost: 60000,
    notes: "Incluye motor e instalación eléctrica",
    statusHistory: [
      {
        id: "sh-4-1",
        date: "2023-08-05T09:00:00",
        oldStatus: "",
        newStatus: "pending",
        user: "Admin",
      },
      {
        id: "sh-4-2",
        date: "2023-08-10T14:20:00",
        oldStatus: "pending",
        newStatus: "approved",
        user: "Admin",
      },
      {
        id: "sh-4-3",
        date: "2023-08-15T08:45:00",
        oldStatus: "approved",
        newStatus: "in_progress",
        user: "Admin",
      },
    ],
  },
]

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [activeTab, setActiveTab] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [whatsAppPhone, setWhatsAppPhone] = useState("")
  const [selectedBudgetForWhatsApp, setSelectedBudgetForWhatsApp] = useState<Budget | null>(null)

  // Estados para el presupuesto rápido
  const [materials, setMaterials] = useState<Material[]>([])
  const [quickBudgetItems, setQuickBudgetItems] = useState<BudgetItem[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState("")
  const [materialQuantity, setMaterialQuantity] = useState(1)
  const [laborCost, setLaborCost] = useState(0)
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [notes, setNotes] = useState("")

  // Cargar materiales al iniciar
  useEffect(() => {
    const storedMaterials = getMaterials()
    setMaterials(storedMaterials.length > 0 ? storedMaterials : [])

    // Seleccionar el primer material por defecto si hay materiales disponibles
    if (storedMaterials.length > 0 && !selectedMaterialId) {
      setSelectedMaterialId(storedMaterials[0].id)
    }
  }, [selectedMaterialId])

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || budget.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsViewDialogOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este presupuesto?")) {
      setBudgets(budgets.filter((budget) => budget.id !== id))
    }
  }

  const handleExportPDF = (budget: Budget) => {
    // En una implementación real, aquí se generaría el PDF
    alert(`Exportando presupuesto "${budget.name}" a PDF...`)
  }

  const handleExportExcel = (budget: Budget) => {
    // En una implementación real, aquí se generaría el Excel
    alert(`Exportando presupuesto "${budget.name}" a Excel...`)
  }

  const handleWhatsAppSend = () => {
    if (!selectedBudgetForWhatsApp || !whatsAppPhone) return

    const formattedPhone = whatsAppPhone.replace(/\D/g, "")

    // Crear mensaje con los ítems reales del presupuesto
    const itemsText = selectedBudgetForWhatsApp.items
      .map(
        (item) =>
          `- ${item.name}: ${item.quantity} unidades x ${formatCurrency(item.price)} = ${formatCurrency(
            item.price * item.quantity,
          )}`,
      )
      .join("\n")

    const laborText =
      selectedBudgetForWhatsApp.laborCost > 0
        ? `\n\n*Mano de Obra:* ${formatCurrency(selectedBudgetForWhatsApp.laborCost)}`
        : ""

    const message = `*Presupuesto: ${selectedBudgetForWhatsApp.name}*\n\n*Cliente:* ${
      selectedBudgetForWhatsApp.client
    }\n*Fecha:* ${new Date(selectedBudgetForWhatsApp.date).toLocaleDateString()}\n\n*Detalles:*\n${itemsText}${laborText}\n\n*Total:* ${formatCurrency(
      selectedBudgetForWhatsApp.total,
    )}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    setIsWhatsAppDialogOpen(false)
  }

  const handleOpenWhatsAppDialog = (budget: Budget) => {
    setSelectedBudgetForWhatsApp(budget)
    setIsWhatsAppDialogOpen(true)
  }

  const handleViewHistory = (budget: Budget) => {
    setSelectedBudget(budget)
    setIsHistoryDialogOpen(true)
  }

  const handleStatusChange = (budgetId: string, newStatus: string) => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) => {
        if (budget.id === budgetId) {
          // Crear un nuevo registro en el historial
          const statusChange: StatusChange = {
            id: uuidv4(),
            date: new Date().toISOString(),
            oldStatus: budget.status,
            newStatus: newStatus,
            user: "Admin", // En una implementación real, esto vendría del sistema de autenticación
          }

          // Actualizar el presupuesto con el nuevo estado y el historial actualizado
          return {
            ...budget,
            status: newStatus,
            statusHistory: [...(budget.statusHistory || []), statusChange],
          }
        }
        return budget
      }),
    )

    // Si estamos cambiando el estado desde el diálogo de detalles, actualizar también el presupuesto seleccionado
    if (selectedBudget && selectedBudget.id === budgetId) {
      setSelectedBudget((prev) => {
        if (!prev) return null

        const statusChange: StatusChange = {
          id: uuidv4(),
          date: new Date().toISOString(),
          oldStatus: prev.status,
          newStatus: newStatus,
          user: "Admin",
        }

        return {
          ...prev,
          status: newStatus,
          statusHistory: [...(prev.statusHistory || []), statusChange],
        }
      })
    }
  }

  // Funciones para el presupuesto rápido
  const handleAddMaterial = () => {
    if (!selectedMaterialId || materialQuantity <= 0) return

    const material = materials.find((m) => m.id === selectedMaterialId)
    if (!material) return

    const newItem: BudgetItem = {
      id: uuidv4(),
      materialId: material.id,
      quantity: materialQuantity,
      name: `${material.type} ${material.size}`,
      price: material.price,
    }

    setQuickBudgetItems([...quickBudgetItems, newItem])
    setMaterialQuantity(1) // Reset quantity after adding
  }

  const handleRemoveQuickBudgetItem = (id: string) => {
    setQuickBudgetItems(quickBudgetItems.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    const materialsTotal = quickBudgetItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return materialsTotal + laborCost
  }

  const handleSaveQuickBudget = () => {
    if (!clientName || !projectName || quickBudgetItems.length === 0) {
      alert("Por favor complete los datos del cliente, nombre del proyecto y agregue al menos un material")
      return
    }

    const newBudget: Budget = {
      id: uuidv4(),
      name: projectName,
      client: clientName,
      date: new Date().toISOString().split("T")[0],
      total: calculateTotal(),
      status: "pending",
      items: quickBudgetItems,
      laborCost: laborCost,
      notes: notes,
      statusHistory: [
        {
          id: uuidv4(),
          date: new Date().toISOString(),
          oldStatus: "",
          newStatus: "pending",
          user: "Admin",
        },
      ],
    }

    setBudgets([newBudget, ...budgets])

    // Reset form
    setQuickBudgetItems([])
    setClientName("")
    setProjectName("")
    setLaborCost(0)
    setNotes("")

    alert("Presupuesto creado exitosamente")
    setActiveTab("list")
  }

  const handleSendQuickBudgetWhatsApp = () => {
    if (!clientName || quickBudgetItems.length === 0) {
      alert("Por favor complete los datos del cliente y agregue al menos un material")
      return
    }

    const total = calculateTotal()

    // Crear mensaje con los ítems del presupuesto rápido
    const itemsText = quickBudgetItems
      .map(
        (item) =>
          `- ${item.name}: ${item.quantity} unidades x ${formatCurrency(item.price)} = ${formatCurrency(
            item.price * item.quantity,
          )}`,
      )
      .join("\n")

    const laborText = laborCost > 0 ? `\n\n*Mano de Obra:* ${formatCurrency(laborCost)}` : ""

    const message = `*Presupuesto: ${projectName || "Nuevo Proyecto"}*\n\n*Cliente:* ${
      clientName
    }\n*Fecha:* ${new Date().toLocaleDateString()}\n\n*Detalles:*\n${itemsText}${laborText}\n\n*Total:* ${formatCurrency(
      total,
    )}\n\n${notes ? `*Notas:* ${notes}` : ""}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Pendiente</span>
      case "approved":
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Aprobado</span>
      case "in_progress":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">En proceso</span>
      case "completed":
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">Completado</span>
      case "cancelled":
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Cancelado</span>
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    return budgetStatuses.find((s) => s.value === status)?.label || status
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <div className="flex gap-2">
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Presupuesto Rápido
            </Button>
            <Button asChild>
              <a href="/carrito">
                <Calculator className="mr-2 h-4 w-4" />
                Desde Carrito
              </a>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Presupuestos</TabsTrigger>
            <TabsTrigger value="create">Crear Presupuesto Rápido</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Busque y filtre los presupuestos según sus necesidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <Input
                      id="search"
                      placeholder="Buscar por nombre o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Estado</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {budgetStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Presupuestos</CardTitle>
                <CardDescription>Gestione sus presupuestos y realice un seguimiento de su estado</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No se encontraron presupuestos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBudgets.map((budget) => (
                        <TableRow key={budget.id}>
                          <TableCell>{budget.name}</TableCell>
                          <TableCell>{budget.client}</TableCell>
                          <TableCell>{new Date(budget.date).toLocaleDateString()}</TableCell>
                          <TableCell>{formatCurrency(budget.total)}</TableCell>
                          <TableCell>{getStatusBadge(budget.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleViewBudget(budget)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleViewHistory(budget)}>
                                <History className="h-4 w-4" />
                                <span className="sr-only">Historial</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleExportPDF(budget)}>
                                <FileDown className="h-4 w-4" />
                                <span className="sr-only">Exportar PDF</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenWhatsAppDialog(budget)}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Enviar WhatsApp</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Crear Presupuesto Rápido</CardTitle>
                <CardDescription>
                  Genere un presupuesto rápidamente seleccionando los materiales necesarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nombre del Cliente</Label>
                    <Input
                      id="client-name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ingrese el nombre del cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Nombre del Proyecto</Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Ingrese el nombre del proyecto"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Agregar Materiales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="material-select">Material</Label>
                      <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                        <SelectTrigger id="material-select">
                          <SelectValue placeholder="Seleccione un material" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.type} {material.size} - {formatCurrency(material.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material-quantity">Cantidad</Label>
                      <Input
                        id="material-quantity"
                        type="number"
                        min={1}
                        value={materialQuantity}
                        onChange={(e) => setMaterialQuantity(Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddMaterial} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  {quickBudgetItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unitario</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quickBudgetItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveQuickBudgetItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No hay materiales agregados</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor-cost">Costo de Mano de Obra</Label>
                  <Input
                    id="labor-cost"
                    type="number"
                    min={0}
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ingrese notas o detalles adicionales"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Total</h3>
                    <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSendQuickBudgetWhatsApp}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar por WhatsApp
                  </Button>
                  <Button onClick={handleSaveQuickBudget}>Guardar Presupuesto</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            {selectedBudget && (
              <>
                <DialogHeader>
                  <DialogTitle>Detalles del Presupuesto</DialogTitle>
                  <DialogDescription>Información completa del presupuesto seleccionado</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre del Proyecto</p>
                      <p className="text-lg font-semibold">{selectedBudget.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                      <p className="text-lg font-semibold">{selectedBudget.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                      <p className="text-lg font-semibold">{new Date(selectedBudget.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedBudget.status}
                          onValueChange={(value) => handleStatusChange(selectedBudget.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Cambiar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewHistory(selectedBudget)}
                          title="Ver historial de cambios"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">Materiales</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unitario</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBudget.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedBudget.laborCost > 0 && (
                    <div className="border rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold mb-2">Mano de Obra</h3>
                      <p className="text-muted-foreground">Incluye corte, soldadura y montaje</p>
                      <p className="text-xl font-bold mt-2">{formatCurrency(selectedBudget.laborCost)}</p>
                    </div>
                  )}

                  {selectedBudget.notes && (
                    <div className="border rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold mb-2">Notas</h3>
                      <p>{selectedBudget.notes}</p>
                    </div>
                  )}

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Total</h3>
                      <p className="text-2xl font-bold">{formatCurrency(selectedBudget.total)}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportPDF(selectedBudget)}
                    className="w-full sm:w-auto"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportExcel(selectedBudget)}
                    className="w-full sm:w-auto"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </Button>
                  <Button onClick={() => handleOpenWhatsAppDialog(selectedBudget)} className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar por WhatsApp
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Historial de Cambios de Estado</DialogTitle>
              <DialogDescription>Registro de todos los cambios de estado del presupuesto</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedBudget && selectedBudget.statusHistory && selectedBudget.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {selectedBudget.statusHistory.map((change) => (
                    <div key={change.id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {change.oldStatus
                              ? `${getStatusLabel(change.oldStatus)} → ${getStatusLabel(change.newStatus)}`
                              : `Creado como ${getStatusLabel(change.newStatus)}`}
                          </p>
                          <p className="text-sm text-muted-foreground">Usuario: {change.user}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(change.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No hay historial de cambios disponible</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Presupuesto por WhatsApp</DialogTitle>
              <DialogDescription>
                Ingrese el número de teléfono del cliente para enviar el presupuesto
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone">Número de Teléfono</Label>
                <Input
                  id="whatsapp-phone"
                  placeholder="Ej: 5491123456789"
                  value={whatsAppPhone}
                  onChange={(e) => setWhatsAppPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ingrese el número completo con código de país (Ej: 549 para Argentina)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWhatsAppDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleWhatsAppSend} disabled={!whatsAppPhone}>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}
