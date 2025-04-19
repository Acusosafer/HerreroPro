"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase, type Corte, isSupabaseConfigured } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

// Hook para gestionar cortes optimizados con Supabase
export function useCortesDB() {
  const [cortes, setCortes] = useState<Corte[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const [initialized, setInitialized] = useState(false)

  // Cargar cortes al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (isAuthenticated && user && !initialized) {
      fetchCortes()
      setInitialized(true)
    }
  }, [isAuthenticated, user, initialized])

  // Función para obtener todos los cortes del usuario
  const fetchCortes = async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)

    try {
      // Si Supabase está configurado, obtener datos de la base de datos
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("cortes")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false })

        if (error) throw error

        setCortes(data || [])
      } else {
        // Si no está configurado, usar localStorage como fallback
        const storedCortes = localStorage.getItem(`cortes_${user.email}`)
        if (storedCortes) {
          setCortes(JSON.parse(storedCortes))
        }
      }
    } catch (error) {
      console.error("Error al cargar cortes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cortes optimizados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para guardar un corte optimizado
  const saveCorte = async (corte: Omit<Corte, "id" | "user_email" | "created_at">) => {
    if (!isAuthenticated || !user) return null

    try {
      const newCorte: Corte = {
        id: uuidv4(),
        user_email: user.email,
        ...corte,
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from("cortes").insert([newCorte]).select()

        if (error) throw error

        setCortes((prev) => [data[0], ...prev])
        toast({
          title: "Optimización guardada",
          description: "La optimización de cortes se ha guardado correctamente",
        })

        return data[0]
      } else {
        // Fallback a localStorage
        const updatedCortes = [newCorte, ...cortes]
        setCortes(updatedCortes)
        localStorage.setItem(`cortes_${user.email}`, JSON.stringify(updatedCortes))

        toast({
          title: "Optimización guardada",
          description: "La optimización de cortes se ha guardado correctamente (modo local)",
        })

        return newCorte
      }
    } catch (error) {
      console.error("Error al guardar corte:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la optimización de cortes",
        variant: "destructive",
      })
      return null
    }
  }

  // Función para eliminar un corte optimizado
  const deleteCorte = async (id: string) => {
    if (!isAuthenticated || !user) return false

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from("cortes").delete().eq("id", id).eq("user_email", user.email)

        if (error) throw error

        setCortes((prev) => prev.filter((c) => c.id !== id))
        toast({
          title: "Optimización eliminada",
          description: "La optimización de cortes se ha eliminado correctamente",
        })
      } else {
        // Fallback a localStorage
        const updatedCortes = cortes.filter((c) => c.id !== id)
        setCortes(updatedCortes)
        localStorage.setItem(`cortes_${user.email}`, JSON.stringify(updatedCortes))

        toast({
          title: "Optimización eliminada",
          description: "La optimización de cortes se ha eliminado correctamente (modo local)",
        })
      }

      return true
    } catch (error) {
      console.error("Error al eliminar corte:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la optimización de cortes",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    cortes,
    loading,
    fetchCortes,
    saveCorte,
    deleteCorte,
  }
}
