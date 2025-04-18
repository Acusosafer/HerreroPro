"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Pencil, Trash2, UserPlus } from "lucide-react"
import { useAuth, type User } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  )
}

function AdminDashboard() {
  const { users, addUser, updateUser, deleteUser } = useAuth()
  const [activeTab, setActiveTab] = useState("users")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  // Filtrar al administrador principal para no mostrarlo en la lista
  const filteredUsers = users.filter((user) => user.role !== "admin")

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditUserDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
      deleteUser(userId)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administre los usuarios y sus permisos de acceso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Ocultar Contraseñas
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Mostrar Contraseñas
                      </>
                    )}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contraseña</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No hay usuarios registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const isExpired = new Date(user.expiryDate) < new Date()
                        return (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{showPasswords ? user.password : "••••••••"}</TableCell>
                            <TableCell>{new Date(user.expiryDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge variant="destructive">Vencido</Badge>
                              ) : (
                                <Badge variant="success">Activo</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Información general sobre el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Total de Usuarios</p>
                    <p className="text-2xl font-bold">{filteredUsers.length}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Usuarios Activos</p>
                    <p className="text-2xl font-bold">
                      {filteredUsers.filter((user) => new Date(user.expiryDate) >= new Date()).length}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Usuarios Vencidos</p>
                    <p className="text-2xl font-bold">
                      {filteredUsers.filter((user) => new Date(user.expiryDate) < new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo para agregar usuario */}
        <AddUserDialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen} onAddUser={addUser} />

        {/* Diálogo para editar usuario */}
        {selectedUser && (
          <EditUserDialog
            open={isEditUserDialogOpen}
            onOpenChange={setIsEditUserDialogOpen}
            user={selectedUser}
            onUpdateUser={updateUser}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddUser: (user: Omit<User, "id" | "role" | "isActive">) => void
}

function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos
    if (!username || !email || !password || !expiryDate) {
      alert("Todos los campos son obligatorios")
      return
    }

    // Crear nuevo usuario
    onAddUser({
      username,
      email,
      password,
      expiryDate: new Date(expiryDate).toISOString(),
    })

    // Limpiar formulario
    setUsername("")
    setEmail("")
    setPassword("")
    setExpiryDate("")

    // Cerrar diálogo
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
          <DialogDescription>Complete los datos para crear un nuevo usuario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: JuanHerrero"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: juan@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry-date">Fecha de Vencimiento</Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Usuario</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUpdateUser: (user: User) => void
}

function EditUserDialog({ open, onOpenChange, user, onUpdateUser }: EditUserDialogProps) {
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState(user.password)
  const [expiryDate, setExpiryDate] = useState(new Date(user.expiryDate).toISOString().split("T")[0])
  const [isActive, setIsActive] = useState(user.isActive)

  // Actualizar estados cuando cambia el usuario seleccionado
  useState(() => {
    setUsername(user.username)
    setEmail(user.email)
    setPassword(user.password)
    setExpiryDate(new Date(user.expiryDate).toISOString().split("T")[0])
    setIsActive(user.isActive)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos
    if (!username || !email || !password || !expiryDate) {
      alert("Todos los campos son obligatorios")
      return
    }

    // Actualizar usuario
    onUpdateUser({
      ...user,
      username,
      email,
      password,
      expiryDate: new Date(expiryDate).toISOString(),
      isActive,
    })

    // Cerrar diálogo
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>Modifique los datos del usuario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-username">Nombre de Usuario</Label>
            <Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Contraseña</Label>
            <Input
              id="edit-password"
              type="text" // Mostrar en texto plano para facilitar edición
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expiry-date">Fecha de Vencimiento</Label>
            <Input
              id="edit-expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="edit-is-active">Usuario Activo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
