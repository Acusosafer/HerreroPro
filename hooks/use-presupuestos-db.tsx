"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase, type Presupuesto, isSupabaseConfigured } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

// Hook para gestionar presupuestos con Supabase
export function usePresupuestosDB() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const [initialized, setInitialized] = useState(false)

  // Cargar presupuestos al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (isAuthenticated && user && !initialized) {
      fetchPresupuestos()
      setInitialized(true)
    }
  }, [isAuthenticated, user, initialized])

  // Función para obtener todos los presupuestos del usuario
  const fetchPresupuestos = async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)

    try {
      // Si Supabase está configurado, obtener datos de la base de datos
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("presupuestos")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false })

        if (error) throw error

        setPresupuestos(data || [])
      } else {
        // Si no está configurado, usar localStorage como fallback
        const storedPresupuestos = localStorage.getItem(`presupuestos_${user.email}`)
        if (storedPresupuestos) {
          setPresupuestos(JSON.parse(storedPresupuestos))
        }
      }
    } catch (error) {
      console.error("Error al cargar presupuestos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los presupuestos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para guardar un presupuesto
  const savePresupuesto = async (presupuesto: Omit<Presupuesto, "id" | "user_email" | "created_at">) => {
    if (!isAuthenticated || !user) return null

    try {
      const newPresupuesto: Presupuesto = {
        id: uuidv4(),
        user_email: user.email,
        ...presupuesto,
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from("presupuestos").insert([newPresupuesto]).select()

        if (error) throw error

        setPresupuestos((prev) => [data[0], ...prev])
        toast({
          title: "Presupuesto guardado",
          description: "El presupuesto se ha guardado correctamente",
        })

        return data[0]
      } else {
        // Fallback a localStorage
        const updatedPresupuestos = [newPresupuesto, ...presupuestos]
        setPresupuestos(updatedPresupuestos)
        localStorage.setItem(`presupuestos_${user.email}`, JSON.stringify(updatedPresupuestos))

        toast({
          title: "Presupuesto guardado",
          description: "El presupuesto se ha guardado correctamente (modo local)",
        })

        return newPresupuesto
      }
    } catch (error) {
      console.error("Error al guardar presupuesto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el presupuesto",
        variant: "destructive",
      })
      return null
    }
  }

  // Función para actualizar un presupuesto
  const updatePresupuesto = async (presupuesto: Presupuesto) => {
    if (!isAuthenticated || !user) return false

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("presupuestos")
          .update(presupuesto)
          .eq("id", presupuesto.id)
          .eq("user_email", user.email)

        if (error) throw error

        setPresupuestos((prev) => prev.map((p) => (p.id === presupuesto.id ? presupuesto : p)))
        toast({
          title: "Presupuesto actualizado",
          description: "El presupuesto se ha actualizado correctamente",
        })
      } else {
        // Fallback a localStorage
        const updatedPresupuestos = presupuestos.map((p) => (p.id === presupuesto.id ? presupuesto : p))
        setPresupuestos(updatedPresupuestos)
        localStorage.setItem(`presupuestos_${user.email}`, JSON.stringify(updatedPresupuestos))

        toast({
          title: "Presupuesto actualizado",
          description: "El presupuesto se ha actualizado correctamente (modo local)",
        })
      }

      return true
    } catch (error) {
      console.error("Error al actualizar presupuesto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto",
        variant: "destructive",
      })
      return false
    }
  }

  // Función para eliminar un presupuesto
  const deletePresupuesto = async (id: string) => {
    if (!isAuthenticated || !user) return false

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from("presupuestos").delete().eq("id", id).eq("user_email", user.email)

        if (error) throw error

        setPresupuestos((prev) => prev.filter((p) => p.id !== id))
        toast({
          title: "Presupuesto eliminado",
          description: "El presupuesto se ha eliminado correctamente",
        })
      } else {
        // Fallback a localStorage
        const updatedPresupuestos = presupuestos.filter((p) => p.id !== id)
        setPresupuestos(updatedPresupuestos)
        localStorage.setItem(`presupuestos_${user.email}`, JSON.stringify(updatedPresupuestos))

        toast({
          title: "Presupuesto eliminado",
          description: "El presupuesto se ha eliminado correctamente (modo local)",
        })
      }

      return true
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    presupuestos,
    loading,
    fetchPresupuestos,
    savePresupuesto,
    updatePresupuesto,
    deletePresupuesto,
  }
}
