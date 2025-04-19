"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Si la ruta es solo para admin y el usuario no es admin, redirigir
    if (adminOnly && !isAdmin) {
      router.push("/")
      return
    }

    // Verificar si el usuario ha expirado (excepto admin)
    if (user && user.role !== "admin") {
      const isExpired = new Date(user.expiryDate) < new Date()
      if (isExpired) {
        router.push("/expired")
      }
    }
  }, [isAuthenticated, isAdmin, router, user, adminOnly])

  // Si no está autenticado o no tiene permisos, no mostrar nada
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null
  }

  return <>{children}</>
}
