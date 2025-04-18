"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Tipos para los usuarios
export interface User {
  id: string
  username: string
  email: string
  password: string
  expiryDate: string // Fecha en formato ISO
  role: "admin" | "user"
  isActive: boolean
}

// Datos iniciales para el administrador
const adminUser: User = {
  id: "admin-1",
  username: "Acusosafer",
  email: "admin@herreropro.com",
  password: "Olivia10",
  expiryDate: "2099-12-31", // Nunca expira
  role: "admin",
  isActive: true,
}

// Datos iniciales para usuarios de prueba
const initialUsers: User[] = [
  adminUser,
  {
    id: "user-1",
    username: "HerreroPrueba",
    email: "herrero@test.com",
    password: "test123",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días desde ahora
    role: "user",
    isActive: true,
  },
  {
    id: "user-2",
    username: "HerreroCaducado",
    email: "caducado@test.com",
    password: "test123",
    expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás (caducado)
    role: "user",
    isActive: true,
  },
]

// Interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  addUser: (user: Omit<User, "id" | "role" | "isActive">) => void
  updateUser: (user: User) => void
  deleteUser: (id: string) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Cargar usuarios del localStorage al iniciar
  useEffect(() => {
    const storedUsers = localStorage.getItem("herrero_users")
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    } else {
      // Si no hay usuarios almacenados, usar los iniciales
      setUsers(initialUsers)
      localStorage.setItem("herrero_users", JSON.stringify(initialUsers))
    }

    // Verificar si hay un usuario en sesión
    const storedUser = localStorage.getItem("herrero_current_user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      // Verificar si el usuario ha expirado
      const isExpired = new Date(parsedUser.expiryDate) < new Date()

      if (isExpired && parsedUser.role !== "admin") {
        // Si ha expirado y no es admin, cerrar sesión
        localStorage.removeItem("herrero_current_user")
      } else {
        setUser(parsedUser)
      }
    }

    setIsLoading(false)
  }, [])

  // Guardar usuarios en localStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("herrero_users", JSON.stringify(users))
    }
  }, [users, isLoading])

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    // Buscar usuario por email
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (!foundUser) {
      return { success: false, message: "Credenciales incorrectas" }
    }

    // Verificar si el usuario ha expirado (excepto admin)
    if (foundUser.role !== "admin") {
      const isExpired = new Date(foundUser.expiryDate) < new Date()
      if (isExpired) {
        return { success: false, message: "Acceso expirado. Contacte al administrador" }
      }
    }

    // Verificar si el usuario está activo
    if (!foundUser.isActive) {
      return { success: false, message: "Usuario desactivado. Contacte al administrador" }
    }

    // Guardar usuario en sesión
    setUser(foundUser)
    localStorage.setItem("herrero_current_user", JSON.stringify(foundUser))

    return { success: true, message: "Inicio de sesión exitoso" }
  }

  // Función para cerrar sesión
  const logout = () => {
    setUser(null)
    localStorage.removeItem("herrero_current_user")
    router.push("/login")
  }

  // Función para agregar un nuevo usuario
  const addUser = (newUser: Omit<User, "id" | "role" | "isActive">) => {
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      role: "user",
      isActive: true,
    }
    setUsers([...users, user])
  }

  // Función para actualizar un usuario
  const updateUser = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))

    // Si el usuario actualizado es el actual, actualizar también la sesión
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser)
      localStorage.setItem("herrero_current_user", JSON.stringify(updatedUser))
    }
  }

  // Función para eliminar un usuario
  const deleteUser = (id: string) => {
    // No permitir eliminar al administrador principal
    if (id === adminUser.id) {
      return
    }

    setUsers(users.filter((u) => u.id !== id))

    // Si el usuario eliminado es el actual, cerrar sesión
    if (user && user.id === id) {
      logout()
    }
  }

  const value = {
    user,
    users,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
