"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { Trash2, FileDown, Send, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Actualizar el cálculo del totalAmount para usar precio unitario * cantidad
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const handleClearCart = () => {
    if (confirm("¿Está seguro de que desea vaciar el carrito?")) {
      clearCart()
    }
  }

  const handleExportPDF = () => {
    // En una implementación real, aquí se generaría el PDF
    alert("Exportando a PDF...")
    setIsExportDialogOpen(false)
  }

  const handleExportExcel = () => {
    // En una implementación real, aquí se generaría el Excel
    alert("Exportando a Excel...")
    setIsExportDialogOpen(false)
  }

  const handleWhatsApp = () => {
    // Actualizar el mensaje de WhatsApp para mostrar correctamente los precios
    const message = `*Presupuesto de HerreroPRO*\n\n*Cliente:* ${clientInfo.name}\n*Email:* ${clientInfo.email}\n*Teléfono:* ${clientInfo.phone}\n*Dirección:* ${clientInfo.address}\n\n*Detalle de materiales:*\n${items.map((item) => `- ${item.quantity}x ${item.name}: ${formatCurrency(item.price)} c/u = ${formatCurrency(item.price * item.quantity)}`).join("\n")}\n\n*Total:* ${formatCurrency(totalAmount)}\n\n*Notas:* ${clientInfo.notes}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    setIsExportDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground mb-4">El carrito está vacío</p>
              <Button asChild>
                <a href="/optimizacion">Comenzar a Optimizar</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Materiales Seleccionados</CardTitle>
                <CardDescription>Revise los materiales y cantidades antes de generar el presupuesto</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {items.map((item) => (
                      // Actualizar la tabla para mostrar correctamente el precio unitario y el subtotal
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value))}
                              className="w-16 h-8 text-center"
                              min={1}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleClearCart}>
                  Vaciar Carrito
                </Button>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </CardFooter>
            </Card>

            <div className="flex justify-end gap-2">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Presupuesto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generar Presupuesto</DialogTitle>
                    <DialogDescription>
                      Complete la información del cliente para generar el presupuesto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nombre del Cliente</Label>
                      <Input
                        id="client-name"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Teléfono</Label>
                      <Input
                        id="client-phone"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-address">Dirección</Label>
                      <Input
                        id="client-address"
                        value={clientInfo.address}
                        onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-notes">Notas</Label>
                      <Textarea
                        id="client-notes"
                        value={clientInfo.notes}
                        onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleExportPDF} className="w-full">
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel} className="w-full">
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Excel
                    </Button>
                    <Button onClick={handleWhatsApp} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar por WhatsApp
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
