"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./use-auth"

export type Material = {
  id: string
  type: string
  size: string
  length: number
  price: number
}

export function useMaterialsDB() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user?.email) {
      fetchMaterials()
    } else {
      setMaterials([])
      setLoading(false)
    }
  }, [user])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      if (!user?.email) return

      const { data, error } = await supabase
        .from("materiales")
        .select("*")
        .eq("user_email", user.email)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to match our Material type
      const transformedData = data.map((item) => ({
        id: item.id,
        type: item.type,
        size: item.size,
        length: Number(item.length),
        price: Number(item.price),
      }))

      setMaterials(transformedData)
    } catch (error) {
      console.error("Error fetching materials:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveMaterial = async (material: Omit<Material, "id">) => {
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para guardar materiales",
          variant: "destructive",
        })
        return null
      }

      // Generate a proper UUID using the uuid package
      const id = uuidv4()

      const { error } = await supabase.from("materiales").insert([
        {
          id,
          user_email: user.email,
          type: material.type,
          size: material.size,
          length: material.length,
          price: material.price,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Material guardado",
        description: "El material se ha guardado correctamente",
      })

      // Refresh the materials list
      await fetchMaterials()

      return id
    } catch (error: any) {
      console.error("Error al guardar material:", error)
      toast({
        title: "Error",
        description: `Error al guardar material: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  }

  const updateMaterial = async (material: Material) => {
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para actualizar materiales",
          variant: "destructive",
        })
        return false
      }

      const { error } = await supabase
        .from("materiales")
        .update({
          type: material.type,
          size: material.size,
          length: material.length,
          price: material.price,
        })
        .eq("id", material.id)
        .eq("user_email", user.email)

      if (error) {
        throw error
      }

      toast({
        title: "Material actualizado",
        description: "El material se ha actualizado correctamente",
      })

      // Refresh the materials list
      await fetchMaterials()

      return true
    } catch (error: any) {
      console.error("Error al actualizar material:", error)
      toast({
        title: "Error",
        description: `Error al actualizar material: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  }

  const deleteMaterial = async (id: string) => {
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para eliminar materiales",
          variant: "destructive",
        })
        return false
      }

      const { error } = await supabase.from("materiales").delete().eq("id", id).eq("user_email", user.email)

      if (error) {
        throw error
      }

      toast({
        title: "Material eliminado",
        description: "El material se ha eliminado correctamente",
      })

      // Update the local state
      setMaterials(materials.filter((m) => m.id !== id))

      return true
    } catch (error: any) {
      console.error("Error al eliminar material:", error)
      toast({
        title: "Error",
        description: `Error al eliminar material: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  }

  return {
    materials,
    loading,
    fetchMaterials,
    saveMaterial,
    updateMaterial,
    deleteMaterial,
  }
}
